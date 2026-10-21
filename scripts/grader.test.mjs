import { describe, expect, it } from 'vitest';
import { findPython } from './lib/python.mjs';
import { runGrader } from './lib/run-grader.mjs';

// Không có CPython 3.12+ trên máy thì bỏ qua — `npm run test` vẫn chạy được.
const python = findPython();
const describeWithPython = python.error ? describe.skip : describe;

const grade = (code, tests) => runGrader(python.command, { code, tests }, 5000);

describeWithPython('grader.py', () => {
  it('chấm đúng cả 5 loại test khi code đúng', async () => {
    const code = [
      'ten = input()',
      'print(f"Xin chào {ten}")',
      'diem = 10',
      'def cong(a, b):',
      '    return a + b',
    ].join('\n');
    const { report } = await grade(code, [
      { type: 'stdout_equals', expected: 'Xin chào Lan\n', stdin: 'Lan\n', message: 'm' },
      { type: 'stdout_contains', expected: 'Xin chào', stdin: 'Lan\n', message: 'm' },
      { type: 'variable_equals', name: 'diem', expected: 10, stdin: 'Lan\n', message: 'm' },
      {
        type: 'function_returns',
        name: 'cong',
        args: [2, 3],
        expected: 5,
        stdin: 'Lan\n',
        message: 'm',
      },
      { type: 'python_assert', code: 'assert diem == 10', stdin: 'Lan\n', message: 'm' },
    ]);
    expect(report.passed).toBe(true);
    expect(report.results).toHaveLength(5);
  });

  it('bỏ qua khác biệt về khoảng trắng cuối dòng và dòng cuối', async () => {
    const { report } = await grade('print("Xin chào")', [
      { type: 'stdout_equals', expected: 'Xin chào', message: 'm' },
    ]);
    expect(report.passed).toBe(true);
  });

  it('nói rõ cần gì và nhận được gì khi output sai', async () => {
    const { report } = await grade('print("Chào")', [
      { type: 'stdout_equals', expected: 'Xin chào', message: 'm' },
    ]);
    expect(report.passed).toBe(false);
    expect(report.results[0].detail).toContain('Xin chào');
    expect(report.results[0].detail).toContain('Chào');
  });

  it('báo lỗi Python khi code học sinh ném lỗi', async () => {
    const { report } = await grade('print(1/0)', [
      { type: 'stdout_equals', expected: 'x', message: 'm' },
    ]);
    expect(report.passed).toBe(false);
    expect(report.results[0].detail).toContain('ZeroDivisionError');
  });

  it('báo khi thiếu biến hoặc thiếu hàm', async () => {
    const missingVariable = await grade('x = 1', [
      { type: 'variable_equals', name: 'diem', expected: 10, message: 'm' },
    ]);
    expect(missingVariable.report.results[0].detail).toContain('không tìm thấy biến');

    const missingFunction = await grade('x = 1', [
      { type: 'function_returns', name: 'cong', args: [1, 2], expected: 3, message: 'm' },
    ]);
    expect(missingFunction.report.results[0].detail).toContain('không tìm thấy hàm');
  });

  it('báo khi hàm trả về sai và khi assert thất bại', async () => {
    const wrongReturn = await grade('def cong(a, b):\n    return a - b', [
      { type: 'function_returns', name: 'cong', args: [5, 2], expected: 7, message: 'm' },
    ]);
    expect(wrongReturn.report.passed).toBe(false);
    expect(wrongReturn.report.results[0].detail).toContain('nhận 3');

    const failedAssert = await grade('diem = 1', [
      { type: 'python_assert', code: 'assert diem > 5', message: 'm' },
    ]);
    expect(failedAssert.report.passed).toBe(false);
    expect(failedAssert.report.results[0].detail).toContain('AssertionError');
  });

  it('mỗi test chạy trong namespace riêng, không ảnh hưởng nhau', async () => {
    const { report } = await grade('dem = 0\ndem += 1\nprint(dem)', [
      { type: 'stdout_equals', expected: '1', message: 'm' },
      { type: 'stdout_equals', expected: '1', message: 'm' },
    ]);
    expect(report.passed).toBe(true);
  });

  it('giữ nguyên `message` tiếng Việt của từng test để UI dùng lại', async () => {
    const { report } = await grade('print("sai")', [
      { type: 'stdout_equals', expected: 'đúng', message: 'Thử lại nhé em.' },
    ]);
    expect(report.results[0].message).toBe('Thử lại nhé em.');
  });

  it('dừng tiến trình khi code lặp vô hạn', async () => {
    const result = await runGrader(
      python.command,
      {
        code: 'while True:\n    pass',
        tests: [{ type: 'stdout_equals', expected: 'x', message: 'm' }],
      },
      0,
      500,
    );
    expect(result.timedOut).toBe(true);
  }, 20_000);
});
