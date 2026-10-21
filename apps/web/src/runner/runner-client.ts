/**
 * Phía main thread của runner: tạo worker, gửi lệnh, gom kết quả, và **cầm
 * đồng hồ**. Worker đang kẹt trong `while True:` thì không trả lời message nào,
 * nên hết giờ chỉ có một cách dừng: `terminate()` rồi dựng worker mới
 * (docs/architecture.md §2).
 */
import {
  isRunnerResponse,
  type DrawCommand,
  type GradedPayload,
  type ReadyPayload,
  type ResultPayload,
  type RunnerErrorPayload,
  type RunnerRequest,
  type RunnerResponse,
} from './protocol';

/** Mặc định 5 giây; bài có vòng lặp nặng được khai báo tối đa 10 giây. */
export const DEFAULT_TIMEOUT_MS = 5000;
export const MAX_TIMEOUT_MS = 10_000;
export const MIN_TIMEOUT_MS = 1000;
/**
 * Trần cho việc **nạp** Pyodide (≈13 MB WASM). Trên máy yếu hoặc mạng chậm,
 * lần đầu có thể mất hàng chục giây — đó không phải lỗi của code trẻ, nên nó
 * có đồng hồ riêng, rộng hơn nhiều.
 */
export const LOAD_TIMEOUT_MS = 60_000;

/**
 * `timeout` và `cancelled` do main thread tự sinh ra, không đi qua giao thức:
 * worker lúc đó đã bị `terminate()` nên không nói gì được nữa.
 */
export type RunErrorKind = RunnerErrorPayload['kind'] | 'timeout' | 'cancelled';

export interface RunError {
  kind: RunErrorKind;
  message: string;
}

export interface RunOptions {
  stdin?: string;
  /** Giới hạn thời gian cho lần chạy này; tự kẹp trong [1s, 10s]. */
  timeoutMs?: number;
  onOutput?: (chunk: { stream: 'stdout' | 'stderr'; text: string }) => void;
}

/** Lệnh vẽ của rùa trong lần chạy này; rỗng nếu bài không dùng `turtle`. */
export type RunOutcome =
  | { ok: true; result: ResultPayload; drawing: DrawCommand[] }
  | { ok: false; error: RunError; drawing: DrawCommand[] };

/** Kết quả chấm bài: `report.results` theo đúng thứ tự test trong bài tập. */
export type GradeOutcome = { ok: true; report: GradedPayload } | { ok: false; error: RunError };

export interface Runner {
  preload: () => Promise<ReadyPayload>;
  run: (code: string, options?: RunOptions) => Promise<RunOutcome>;
  /** Chạy code của trẻ với test ẩn của bài; chấm bằng chính `grader.py`. */
  grade: (code: string, tests: readonly unknown[], options?: RunOptions) => Promise<GradeOutcome>;
  /** Trẻ bấm "Dừng": giết worker đang chạy, lần chạy đang chờ trả về `cancelled`. */
  cancel: () => void;
  dispose: () => void;
}

export type WorkerFactory = () => Worker;

const defaultWorkerFactory: WorkerFactory = () =>
  new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

const clampTimeout = (value: number | undefined): number =>
  Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, value ?? DEFAULT_TIMEOUT_MS));

/** Ai đang chờ worker trả lời, để còn báo khi worker bị giết giữa chừng. */
interface Pending {
  id: string;
  fail: (error: RunError) => void;
}

export function createRunner(createWorker: WorkerFactory = defaultWorkerFactory): Runner {
  let worker = createWorker();
  let nextId = 0;
  let pending: Pending | null = null;
  let disposed = false;

  /** Giết worker hiện tại và dựng cái mới; lần chạy đang chờ nhận `error`. */
  function restart(error: RunError): void {
    worker.terminate();
    const waiting = pending;
    pending = null;
    if (!disposed) worker = createWorker();
    waiting?.fail(error);
  }

  /** `init`: nạp Pyodide. Không đặt đồng hồ ở đây — máy yếu nạp lâu là bình thường. */
  function sendInit(): Promise<ReadyPayload> {
    const id = `r${++nextId}`;
    const currentWorker = worker;
    return new Promise<ReadyPayload>((resolve, reject) => {
      const onMessage = (event: MessageEvent<unknown>) => {
        if (!isRunnerResponse(event.data) || event.data.id !== id) return;
        const response = event.data;
        if (response.type === 'ready') {
          currentWorker.removeEventListener('message', onMessage);
          resolve(response.payload);
        }
        if (response.type === 'error') {
          currentWorker.removeEventListener('message', onMessage);
          reject(new Error(response.payload.message));
        }
      };
      currentWorker.addEventListener('message', onMessage);
      currentWorker.addEventListener(
        'error',
        (event: ErrorEvent) => reject(new Error(event.message || 'Worker gặp lỗi')),
        { once: true },
      );
      currentWorker.postMessage({ type: 'init', id } satisfies RunnerRequest);
    });
  }

  /**
   * Khung chung cho `run` và `grade`: hai đồng hồ (nạp Pyodide / chạy code),
   * gom stdout, và luôn trả về một giá trị thay vì treo.
   */
  function execute<T>(
    buildRequest: (id: string) => RunnerRequest,
    options: RunOptions,
    onResponse: (
      response: RunnerResponse,
      settle: (value: T) => void,
      drawing: DrawCommand[],
    ) => void,
    toFailure: (error: RunError, drawing: DrawCommand[]) => T,
  ): Promise<T> {
    const timeoutMs = clampTimeout(options.timeoutMs);
    return new Promise<T>((resolve) => {
      const id = `r${++nextId}`;
      const currentWorker = worker;
      const drawing: DrawCommand[] = [];
      let settled = false;

      let timer = setTimeout(() => {
        restart({ kind: 'internal', message: 'Nạp Python quá lâu' });
      }, LOAD_TIMEOUT_MS);

      const settle = (value: T) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        currentWorker.removeEventListener('message', onMessage);
        if (pending?.id === id) pending = null;
        resolve(value);
      };

      const onMessage = (event: MessageEvent<unknown>) => {
        if (!isRunnerResponse(event.data) || event.data.id !== id) return;
        const response = event.data;
        if (response.type === 'drawing') {
          drawing.push(...response.payload.commands);
          return;
        }
        if (response.type === 'started') {
          // Pyodide đã sẵn sàng: từ đây mới tính giờ chạy code.
          clearTimeout(timer);
          timer = setTimeout(() => {
            // Worker đang kẹt: giết nó, dựng cái mới, rồi mới trả lời.
            restart({
              kind: 'timeout',
              message: `Code chạy quá ${Math.round(timeoutMs / 1000)} giây`,
            });
          }, timeoutMs);
          return;
        }
        if (response.type === 'stdout' || response.type === 'stderr') {
          options.onOutput?.({ stream: response.type, text: response.payload.text });
          return;
        }
        if (response.type === 'error') {
          settle(toFailure(response.payload, drawing));
          return;
        }
        onResponse(response, settle, drawing);
      };

      pending = { id, fail: (error) => settle(toFailure(error, drawing)) };
      currentWorker.addEventListener('message', onMessage);
      currentWorker.addEventListener(
        'error',
        (event: ErrorEvent) =>
          restart({ kind: 'internal', message: event.message || 'Worker gặp lỗi' }),
        { once: true },
      );
      currentWorker.postMessage(buildRequest(id));
    });
  }

  return {
    preload: sendInit,

    run: (code, options = {}) =>
      execute<RunOutcome>(
        (id) => ({
          type: 'run',
          id,
          payload: { code, ...(options.stdin === undefined ? {} : { stdin: options.stdin }) },
        }),
        options,
        (response, settle, drawing) => {
          if (response.type === 'result') {
            settle({ ok: true, result: response.payload, drawing });
          }
        },
        (error, drawing) => ({ ok: false, error, drawing }),
      ),

    grade: (code, tests, options = {}) =>
      execute<GradeOutcome>(
        (id) => ({ type: 'grade', id, payload: { code, tests } }),
        options,
        (response, settle) => {
          if (response.type === 'graded') settle({ ok: true, report: response.payload });
        },
        (error) => ({ ok: false, error }),
      ),

    cancel: () => {
      if (pending) restart({ kind: 'cancelled', message: 'Đã dừng theo yêu cầu' });
    },

    dispose: () => {
      disposed = true;
      restart({ kind: 'cancelled', message: 'Runner đã đóng' });
    },
  };
}
