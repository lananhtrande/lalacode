import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from './contrast';

describe('tỉ lệ tương phản', () => {
  it('đen trên trắng là 21:1, trắng trên trắng là 1:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
  });

  it('không phụ thuộc thứ tự chữ/nền', () => {
    expect(contrastRatio('#0f766e', '#ffffff')).toBe(contrastRatio('#ffffff', '#0f766e'));
  });

  it('khớp giá trị tham chiếu của WCAG (#777 trên trắng ≈ 4.48)', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('màu sai dạng thì báo lỗi rõ', () => {
    expect(() => relativeLuminance('teal')).toThrow('#rrggbb');
  });
});
