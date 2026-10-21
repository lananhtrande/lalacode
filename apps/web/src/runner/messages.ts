import { vi } from '../shared/i18n/vi';
import type { RunError } from './runner-client';

/**
 * Đổi lỗi của runner thành câu tiếng Việt cho trẻ.
 * Lỗi Python giữ nguyên nội dung (S0-09 sẽ dịch traceback sang tiếng Việt).
 */
export function runnerErrorMessage(error: RunError): string {
  switch (error.kind) {
    case 'timeout':
      return vi.runner.timeout;
    case 'cancelled':
      return vi.runner.cancelled;
    case 'internal':
      return vi.runner.internal;
    case 'python':
      return error.message;
  }
}
