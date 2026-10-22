import { describe, expect, it } from 'vitest';
import { REDACTED, sanitizeForAi } from './sanitize';

describe('lọc trước khi gửi cho AI', () => {
  it('che email', () => {
    const result = sanitizeForAi('print("mail me: lan.anh@example.com")', 4000);
    expect(result.text).not.toContain('lan.anh@example.com');
    expect(result.text).toContain(REDACTED);
    expect(result.redacted).toBe(true);
  });

  it.each([
    'print("gọi em: 0912345678")',
    'print("sđt 091 234 5678")',
    'print("+84912345678")',
    'print("0912.345.678")',
  ])('che số điện thoại: %s', (input) => {
    const result = sanitizeForAi(input, 4000);
    expect(result.text).not.toMatch(/\d{7}/);
    expect(result.redacted).toBe(true);
  });

  it('che dãy số dài kiểu CCCD hoặc số tài khoản', () => {
    const result = sanitizeForAi('so = 079201001234', 4000);
    expect(result.text).not.toContain('079201001234');
  });

  it('che đường link', () => {
    const result = sanitizeForAi('# xem https://facebook.com/ai-do', 4000);
    expect(result.text).not.toContain('facebook.com');
  });

  it('code bình thường thì giữ nguyên từng chữ', () => {
    const code = 'for i in range(10):\n    print(i * 2)';
    const result = sanitizeForAi(code, 4000);
    expect(result.text).toBe(code);
    expect(result.redacted).toBe(false);
  });

  it('không nhầm số nhỏ trong code là thông tin cá nhân', () => {
    const code = 'diem = [8, 9, 10]\nprint(sum(diem) / 3)';
    expect(sanitizeForAi(code, 4000).redacted).toBe(false);
  });

  it('cắt code quá dài và báo đã cắt', () => {
    const result = sanitizeForAi('x'.repeat(5000), 4000);
    expect(result.text).toHaveLength(4000);
    expect(result.truncated).toBe(true);
  });

  it('chuỗi rỗng thì không có gì xảy ra', () => {
    expect(sanitizeForAi('', 4000)).toEqual({ text: '', redacted: false, truncated: false });
  });
});
