import { vi } from '../shared/i18n/vi';
import { translatePythonError, type PythonErrorInfo } from './errors-vi';
import type { RunError } from './runner-client';

/** Thông tin đủ để UI hiển thị một lỗi: câu chính, gợi ý, dòng lỗi, nguyên văn. */
export interface RunErrorInfo {
  title: string;
  hint?: string;
  /** Dòng trong code của trẻ, nếu biết. */
  line?: number;
  /** Nguyên văn lỗi Python — chỉ hiện khi trẻ bấm "xem chi tiết". */
  raw?: string;
}

/** Đổi lỗi của runner thành thông tin tiếng Việt cho trẻ. */
export function describeRunError(error: RunError): RunErrorInfo {
  switch (error.kind) {
    case 'timeout':
      return { title: vi.runner.timeout };
    case 'cancelled':
      return { title: vi.runner.cancelled };
    case 'internal':
      return { title: vi.runner.internal };
    case 'python':
      return fromPython(translatePythonError(error.message));
  }
}

function fromPython(info: PythonErrorInfo): RunErrorInfo {
  return {
    title: info.title,
    ...(info.hint === undefined ? {} : { hint: info.hint }),
    ...(info.line === undefined ? {} : { line: info.line }),
    raw: info.raw,
  };
}

/** Một dòng gọn cho những chỗ chỉ hiện được một câu. */
export function runnerErrorMessage(error: RunError): string {
  const info = describeRunError(error);
  const place = info.line === undefined ? '' : ` (dòng ${info.line})`;
  return info.hint === undefined ? `${info.title}${place}` : `${info.title}${place} ${info.hint}`;
}

/** Lỗi Python trong kết quả chấm bài (grader.py trả về một dòng). */
export function describePythonError(rawError: string): RunErrorInfo {
  return fromPython(translatePythonError(rawError));
}
