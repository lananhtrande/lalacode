import { describe, expect, it } from 'vitest';
import { exampleTests } from './lib/examples.mjs';

describe('exampleTests', () => {
  it('mỗi ví dụ thành một test stdout_equals, kèm dữ liệu nhập nếu có', () => {
    expect(
      exampleTests({
        examples: [{ output: 'Xin chào' }, { input: 'An\n', output: 'Chào An', note: 'Ghi chú' }],
      }),
    ).toEqual([
      { index: 0, test: { type: 'stdout_equals', expected: 'Xin chào', message: 'Ví dụ 1' } },
      {
        index: 1,
        test: { type: 'stdout_equals', expected: 'Chào An', stdin: 'An\n', message: 'Ví dụ 2' },
      },
    ]);
  });

  it('bài không có ví dụ thì không có gì để chạy', () => {
    expect(exampleTests({})).toEqual([]);
  });
});
