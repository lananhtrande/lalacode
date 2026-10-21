/**
 * Phía main thread của runner: tạo worker, gửi lệnh, gom kết quả.
 * Không có logic Python ở đây — chỉ điều phối theo `protocol.ts`.
 */
import {
  isRunnerResponse,
  type ReadyPayload,
  type ResultPayload,
  type RunnerErrorPayload,
  type RunnerRequest,
  type RunnerResponse,
} from './protocol';

export interface RunOptions {
  stdin?: string;
  /** Gọi mỗi khi có dòng mới, để hiện dần output thay vì đợi chạy xong. */
  onOutput?: (chunk: { stream: 'stdout' | 'stderr'; text: string }) => void;
}

export type RunOutcome =
  { ok: true; result: ResultPayload } | { ok: false; error: RunnerErrorPayload };

export interface Runner {
  /** Nạp Pyodide trước (gọi khi trẻ mở bài học, trước lúc tới bài tập). */
  preload: () => Promise<ReadyPayload>;
  run: (code: string, options?: RunOptions) => Promise<RunOutcome>;
  dispose: () => void;
}

/** Cho phép test tiêm worker giả; mặc định là worker Pyodide thật. */
export type WorkerFactory = () => Worker;

const defaultWorkerFactory: WorkerFactory = () =>
  new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

export function createRunner(createWorker: WorkerFactory = defaultWorkerFactory): Runner {
  const worker = createWorker();
  let nextId = 0;

  /** `Omit` trên union phải phân phối từng nhánh, nếu không `payload` biến mất. */
  type RequestWithoutId = RunnerRequest extends infer T
    ? T extends RunnerRequest
      ? Omit<T, 'id'>
      : never
    : never;

  function request<T>(
    message: RequestWithoutId,
    handle: (response: RunnerResponse, resolve: (value: T) => void) => void,
  ): Promise<T> {
    const id = `r${++nextId}`;
    return new Promise<T>((resolve, reject) => {
      const onMessage = (event: MessageEvent<unknown>) => {
        if (!isRunnerResponse(event.data) || event.data.id !== id) return;
        handle(event.data, (value) => {
          worker.removeEventListener('message', onMessage);
          resolve(value);
        });
      };
      const onError = (event: ErrorEvent) => {
        worker.removeEventListener('message', onMessage);
        reject(new Error(event.message || 'Worker gặp lỗi'));
      };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError, { once: true });
      worker.postMessage({ ...message, id });
    });
  }

  return {
    preload: () =>
      request<ReadyPayload>({ type: 'init' }, (response, resolve) => {
        if (response.type === 'ready') resolve(response.payload);
      }),

    run: (code, options = {}) =>
      request<RunOutcome>(
        {
          type: 'run',
          payload: { code, ...(options.stdin === undefined ? {} : { stdin: options.stdin }) },
        },
        (response, resolve) => {
          if (response.type === 'stdout' || response.type === 'stderr') {
            options.onOutput?.({ stream: response.type, text: response.payload.text });
            return;
          }
          if (response.type === 'result') resolve({ ok: true, result: response.payload });
          if (response.type === 'error') resolve({ ok: false, error: response.payload });
        },
      ),

    dispose: () => worker.terminate(),
  };
}
