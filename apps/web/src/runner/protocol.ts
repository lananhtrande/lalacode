/**
 * Giao thức giữa main thread và worker chạy Pyodide.
 *
 * Luật (docs/conventions.md §Runner protocol):
 * - Chỉ truyền JSON thuần, không hàm, không object phức tạp.
 * - Đổi hình dạng message → tăng `PROTOCOL_VERSION` và sửa test.
 *
 * Phiên bản 1: `init`, `run`, `cancel`. Lệnh `grade` sẽ thêm ở S0-08 kèm một
 * lần tăng phiên bản.
 */
export const PROTOCOL_VERSION = 1;

export interface RunPayload {
  code: string;
  /** Dữ liệu cho `input()`; thiếu thì `input()` trả về chuỗi rỗng. */
  stdin?: string;
}

export type RunnerRequest =
  | { type: 'init'; id: string }
  | { type: 'run'; id: string; payload: RunPayload }
  | { type: 'cancel'; id: string };

export interface ReadyPayload {
  protocolVersion: number;
  pythonVersion: string;
  /** Mili-giây để nạp xong Pyodide — dùng để theo dõi máy yếu. */
  loadMs: number;
}

export interface OutputPayload {
  text: string;
}

export interface ResultPayload {
  /** Toàn bộ stdout của lần chạy, đã gom lại. */
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface RunnerErrorPayload {
  /** `python`: code của trẻ sai. `internal`: lỗi của mình. */
  kind: 'python' | 'internal';
  message: string;
}

export type RunnerResponse =
  | { type: 'ready'; id: string; payload: ReadyPayload }
  | { type: 'stdout'; id: string; payload: OutputPayload }
  | { type: 'stderr'; id: string; payload: OutputPayload }
  | { type: 'result'; id: string; payload: ResultPayload }
  | { type: 'error'; id: string; payload: RunnerErrorPayload };

/** Kiểm tra message nhận được đúng hình dạng — worker và main thread có thể lệch phiên bản. */
export function isRunnerResponse(value: unknown): value is RunnerResponse {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as Record<string, unknown>;
  if (typeof message['id'] !== 'string') return false;
  if (typeof message['payload'] !== 'object' || message['payload'] === null) return false;
  return (
    message['type'] === 'ready' ||
    message['type'] === 'stdout' ||
    message['type'] === 'stderr' ||
    message['type'] === 'result' ||
    message['type'] === 'error'
  );
}
