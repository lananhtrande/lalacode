/**
 * Phía main thread của runner: tạo worker, gửi lệnh, gom kết quả, và **cầm
 * đồng hồ**. Worker đang kẹt trong `while True:` thì không trả lời message nào,
 * nên hết giờ chỉ có một cách dừng: `terminate()` rồi dựng worker mới
 * (docs/architecture.md §2).
 */
import {
  isRunnerResponse,
  type ReadyPayload,
  type ResultPayload,
  type RunnerErrorPayload,
  type RunnerRequest,
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

export type RunOutcome = { ok: true; result: ResultPayload } | { ok: false; error: RunError };

export interface Runner {
  preload: () => Promise<ReadyPayload>;
  run: (code: string, options?: RunOptions) => Promise<RunOutcome>;
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
  settle: (outcome: RunOutcome) => void;
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
    waiting?.settle({ ok: false, error });
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

  return {
    preload: sendInit,

    run: (code, options = {}) => {
      const timeoutMs = clampTimeout(options.timeoutMs);
      return new Promise<RunOutcome>((resolve) => {
        const id = `r${++nextId}`;
        const currentWorker = worker;
        let settled = false;

        // Hai đồng hồ: một cho lúc nạp Pyodide, một cho lúc code thật sự chạy.
        let timer = setTimeout(() => {
          restart({ kind: 'internal', message: 'Nạp Python quá lâu' });
        }, LOAD_TIMEOUT_MS);

        const settle = (outcome: RunOutcome) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          currentWorker.removeEventListener('message', onMessage);
          if (pending?.id === id) pending = null;
          resolve(outcome);
        };

        const onMessage = (event: MessageEvent<unknown>) => {
          if (!isRunnerResponse(event.data) || event.data.id !== id) return;
          const response = event.data;
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
          if (response.type === 'result') settle({ ok: true, result: response.payload });
          if (response.type === 'error') settle({ ok: false, error: response.payload });
        };

        pending = { id, settle };
        currentWorker.addEventListener('message', onMessage);
        currentWorker.addEventListener(
          'error',
          (event: ErrorEvent) =>
            restart({ kind: 'internal', message: event.message || 'Worker gặp lỗi' }),
          { once: true },
        );
        currentWorker.postMessage({
          type: 'run',
          id,
          payload: { code, ...(options.stdin === undefined ? {} : { stdin: options.stdin }) },
        } satisfies RunnerRequest);
      });
    },

    cancel: () => {
      if (pending) restart({ kind: 'cancelled', message: 'Đã dừng theo yêu cầu' });
    },

    dispose: () => {
      disposed = true;
      restart({ kind: 'cancelled', message: 'Runner đã đóng' });
    },
  };
}
