import { describe, expect, it } from 'vitest';
import { validateCourseTree, type CourseDirInput } from './validate.ts';

function tree(overrides: Partial<CourseDirInput> = {}): CourseDirInput[] {
  const course: CourseDirInput = {
    dir: 'py-khoi-dong',
    course: {
      id: 'py-khoi-dong',
      title: 'Python khởi động',
      summary: 'Làm quen với Python.',
      ageRange: [10, 15],
      authorId: 'core',
      order: ['01-xin-chao'],
      status: 'draft',
    },
    lessons: [
      {
        dir: '01-xin-chao',
        lesson: {
          id: 'py-khoi-dong.01-xin-chao',
          title: 'Xin chào, Python!',
          concepts: ['print'],
          estimatedMinutes: 10,
          exercises: ['01-in-loi-chao'],
          status: 'draft',
        },
        markdown: '# Xin chào\n\nHôm nay em học lệnh `print`.\n',
        exercises: [
          {
            file: '01-in-loi-chao',
            data: {
              id: 'py-khoi-dong.01-xin-chao.01-in-loi-chao',
              title: 'In lời chào',
              kind: 'code',
              prompt: 'In ra `Xin chào`',
              starterCode: '# Viết code ở đây\n',
              solution: 'print("Xin chào")\n',
              tests: [{ type: 'stdout_equals', expected: 'Xin chào\n', message: 'Thử lại nhé.' }],
              hints: ['Dùng `print`.', 'Chữ trong ngoặc kép.', 'Ví dụ: `print("Chào bạn")`.'],
            },
          },
        ],
      },
    ],
    ...overrides,
  };
  return [course];
}

const errorsOf = (input: CourseDirInput[]) =>
  validateCourseTree(input).filter((issue) => issue.level === 'error');

describe('validateCourseTree', () => {
  it('cây nội dung hợp lệ thì không có vấn đề gì', () => {
    expect(validateCourseTree(tree())).toEqual([]);
  });

  it('cảnh báo khi chưa có khoá học nào', () => {
    const issues = validateCourseTree([]);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.level).toBe('warning');
  });

  it('báo lỗi khi id khoá khác tên thư mục', () => {
    const input = tree();
    input[0]!.dir = 'khoa-khac';
    const errors = errorsOf(input);
    expect(errors.some((issue) => issue.message.includes('trùng tên thư mục'))).toBe(true);
  });

  it('báo lỗi khi id bài học không khớp đường dẫn', () => {
    const input = tree();
    (input[0]!.lessons[0]!.lesson as { id: string }).id = 'py-khoi-dong.99-sai';
    const errors = errorsOf(input);
    expect(errors.some((issue) => issue.message.includes('py-khoi-dong.01-xin-chao'))).toBe(true);
  });

  it('báo lỗi khi bài học có trên đĩa nhưng thiếu trong `order`', () => {
    const input = tree();
    (input[0]!.course as { order: string[] }).order = ['02-bien'];
    const errors = errorsOf(input);
    expect(errors.some((issue) => issue.message.includes('`01-xin-chao` chưa được liệt kê'))).toBe(
      true,
    );
  });

  it('báo lỗi khi `order` nhắc tới bài không tồn tại', () => {
    const input = tree();
    (input[0]!.course as { order: string[] }).order = ['01-xin-chao', '02-khong-co'];
    const errors = errorsOf(input);
    expect(errors.some((issue) => issue.message.includes('không có thư mục'))).toBe(true);
  });

  it('báo lỗi khi file bài tập không được liệt kê trong lesson.json', () => {
    const input = tree();
    input[0]!.lessons[0]!.exercises.push({
      file: '02-them-bai',
      data: { ...(input[0]!.lessons[0]!.exercises[0]!.data as object), id: 'x' },
    });
    const errors = errorsOf(input);
    expect(errors.some((issue) => issue.message.includes('chưa được liệt kê'))).toBe(true);
  });

  it('báo lỗi khi thiếu hoặc rỗng lesson.md', () => {
    const missing = tree();
    missing[0]!.lessons[0]!.markdown = null;
    expect(errorsOf(missing).some((issue) => issue.message.includes('Thiếu file'))).toBe(true);

    const empty = tree();
    empty[0]!.lessons[0]!.markdown = '   \n';
    expect(errorsOf(empty).some((issue) => issue.message.includes('rỗng'))).toBe(true);
  });

  it('báo lỗi khi gợi ý chứa nguyên lời giải', () => {
    const input = tree();
    const exercise = input[0]!.lessons[0]!.exercises[0]!.data as { hints: string[] };
    exercise.hints[2] = 'Viết đúng như này: print("Xin chào")';
    const errors = errorsOf(input);
    expect(errors.some((issue) => issue.message.includes('nguyên lời giải'))).toBe(true);
  });

  it('chỉ cảnh báo (không chặn) khi bài đã published mà có dưới 3 bài tập', () => {
    const input = tree();
    (input[0]!.lessons[0]!.lesson as { status: string }).status = 'published';
    const issues = validateCourseTree(input);
    expect(issues.filter((issue) => issue.level === 'error')).toEqual([]);
    expect(issues.some((issue) => issue.level === 'warning')).toBe(true);
  });

  it('gắn lỗi schema vào đúng file và đúng trường', () => {
    const input = tree();
    (input[0]!.lessons[0]!.exercises[0]!.data as { hints: string[] }).hints = ['chỉ một'];
    const errors = errorsOf(input);
    expect(errors[0]?.where).toBe(
      'content/courses/py-khoi-dong/lessons/01-xin-chao/exercises/01-in-loi-chao.json → hints',
    );
  });
});
