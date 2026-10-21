import { describe, expect, it } from 'vitest';
import { describePythonError, describeRunError, runnerErrorMessage } from './messages';
import { vi as strings } from '../shared/i18n/vi';

describe('describeRunError', () => {
  it('hết giờ: nói về vòng lặp, không mắng trẻ', () => {
    const info = describeRunError({ kind: 'timeout', message: 'Code chạy quá 5 giây' });
    expect(info.title).toBe(strings.runner.timeout);
    expect(info.title).toContain('vòng lặp');
    expect(info.title).not.toMatch(/sai|lỗi của em/i);
  });

  it('bị dừng và lỗi nội bộ đều có câu riêng', () => {
    expect(describeRunError({ kind: 'cancelled', message: '' }).title).toBe(
      strings.runner.cancelled,
    );
    expect(describeRunError({ kind: 'internal', message: '' }).title).toBe(strings.runner.internal);
  });

  it('lỗi Python được dịch sang tiếng Việt, kèm dòng lỗi và nguyên văn', () => {
    const info = describeRunError({
      kind: 'python',
      message: 'File "<exec>", line 2, in <module>\nZeroDivisionError: division by zero',
    });
    expect(info.title).toContain('Không chia được cho 0');
    expect(info.line).toBe(2);
    expect(info.raw).toBe('ZeroDivisionError: division by zero');
  });
});

describe('runnerErrorMessage', () => {
  it('gộp câu chính, dòng lỗi và gợi ý thành một dòng', () => {
    const message = runnerErrorMessage({
      kind: 'python',
      message: 'File "<exec>", line 3, in <module>\nIndexError: list index out of range',
    });
    expect(message).toContain('dòng 3');
    expect(message).toContain('[0]');
  });
});

describe('describePythonError', () => {
  it('đọc được thông báo một dòng từ grader.py', () => {
    const info = describePythonError("NameError: name 'diem' is not defined");
    expect(info.title).toContain('diem');
    expect(info.line).toBeUndefined();
  });
});
