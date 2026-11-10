import { describe, expect, it } from 'vitest';
import { fill } from './fill';

describe('fill', () => {
  it('điền giá trị vào chỗ trống, giữ nguyên chỗ không có giá trị', () => {
    expect(fill('Tiếp tục bài {n}', { n: 3 })).toBe('Tiếp tục bài 3');
    expect(fill('{a} và {b}', { a: 'x' })).toBe('x và {b}');
  });
});
