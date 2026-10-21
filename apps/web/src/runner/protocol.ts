/**
 * Giao thức giữa main thread và worker chạy Pyodide.
 *
 * Luật (docs/conventions.md §Runner protocol):
 * - Chỉ truyền JSON thuần, không hàm, không object phức tạp.
 * - Đổi hình dạng message → tăng `PROTOCOL_VERSION` và sửa test.
 *
 * Phiên bản 3: `init`, `run`, `grade`; worker báo `started` ngay trước khi chạy
 * code để main thread bấm giờ đúng lúc (không tính thời gian nạp Pyodide).
 * Không có `cancel` — một vòng lặp vô hạn không trả lời message nào cả, nên huỷ
 * thật sự là `terminate()` ở main thread (S0-07).
 */
export const PROTOCOL_VERSION = 3;

export interface RunPayload {
  code: string;
  /** Dữ liệu cho `input()`; thiếu thì `input()` trả về chuỗi rỗng. */
  stdin?: string;
}

/** Test lấy nguyên từ bài tập (`packages/content-schema`), truyền thẳng cho grader.py. */
export interface GradePayload {
  code: string;
  tests: readonly unknown[];
}

export type RunnerRequest =
  | { type: 'init'; id: string }
  | { type: 'run'; id: string; payload: RunPayload }
  | { type: 'grade'; id: string; payload: GradePayload };

export interface ReadyPayload {
  protocolVersion: number;
  pythonVersion: string;
  /** Mili-giây để nạp xong Pyodide — dùng để theo dõi máy yếu. */
  loadMs: number;
}

export interface StartedPayload {
  /** Mili-giây đã dùng để nạp Pyodide trước khi chạy (0 nếu đã sẵn sàng). */
  loadedMs: number;
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

export interface TestResult {
  index: number;
  /** Loại test trong docs/content-format.md, ví dụ `stdout_equals`. */
  type: string;
  passed: boolean;
  /** Câu tiếng Việt của người viết bài, hiện khi test fail. */
  message: string | null;
  /** Chi tiết kỹ thuật ("cần ... nhận ..."), để gỡ rối — không bắt buộc hiện cho trẻ. */
  detail: string | null;
}

export interface GradedPayload {
  passed: boolean;
  results: TestResult[];
  durationMs: number;
}

export type RunnerResponse =
  | { type: 'ready'; id: string; payload: ReadyPayload }
  | { type: 'started'; id: string; payload: StartedPayload }
  | { type: 'stdout'; id: string; payload: OutputPayload }
  | { type: 'stderr'; id: string; payload: OutputPayload }
  | { type: 'result'; id: string; payload: ResultPayload }
  | { type: 'graded'; id: string; payload: GradedPayload }
  | { type: 'error'; id: string; payload: RunnerErrorPayload };

/** Kiểm tra message nhận được đúng hình dạng — worker và main thread có thể lệch phiên bản. */
export function isRunnerResponse(value: unknown): value is RunnerResponse {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as Record<string, unknown>;
  if (typeof message['id'] !== 'string') return false;
  if (typeof message['payload'] !== 'object' || message['payload'] === null) return false;
  return (
    message['type'] === 'ready' ||
    message['type'] === 'started' ||
    message['type'] === 'stdout' ||
    message['type'] === 'stderr' ||
    message['type'] === 'result' ||
    message['type'] === 'graded' ||
    message['type'] === 'error'
  );
}
