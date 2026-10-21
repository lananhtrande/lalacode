import { describe, expect, it } from 'vitest';
import { runnerErrorMessage } from './messages';
import { vi as strings } from '../shared/i18n/vi';

describe('runnerErrorMessage', () => {
  it('hết giờ: nói về vòng lặp, không mắng trẻ', () => {
    const message = runnerErrorMessage({ kind: 'timeout', message: 'Code chạy quá 5 giây' });
    expect(message).toBe(strings.runner.timeout);
    expect(message).toContain('vòng lặp');
    expect(message).not.toMatch(/sai|lỗi của em/i);
  });

  it('bị dừng và lỗi nội bộ đều có câu riêng', () => {
    expect(runnerErrorMessage({ kind: 'cancelled', message: '' })).toBe(strings.runner.cancelled);
    expect(runnerErrorMessage({ kind: 'internal', message: '' })).toBe(strings.runner.internal);
  });

  it('lỗi Python giữ nguyên để S0-09 dịch sau', () => {
    expect(runnerErrorMessage({ kind: 'python', message: 'NameError: ten' })).toBe(
      'NameError: ten',
    );
  });
});
