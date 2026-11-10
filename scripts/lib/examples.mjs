// Ví dụ trên đề bài (S0-39) phải khớp đúng với lời giải: chạy lời giải với
// `input` của ví dụ rồi so output bằng chính test `stdout_equals` của grader.py,
// để "khớp" ở đây nghĩa là y như lúc chấm bài trong trình duyệt.

/**
 * @param {{ examples?: { input?: string, output: string }[] }} exercise
 * @returns {{ index: number, test: object }[]} một job chấm cho mỗi ví dụ
 */
export function exampleTests(exercise) {
  return (exercise.examples ?? []).map((example, index) => ({
    index,
    test: {
      type: 'stdout_equals',
      expected: example.output,
      ...(example.input === undefined ? {} : { stdin: example.input }),
      message: `Ví dụ ${index + 1}`,
    },
  }));
}
