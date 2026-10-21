import { describe, expect, it } from 'vitest';
import { buildBundle } from './lib/build-bundle.mjs';

const exercise = (overrides = {}) => ({
  id: 'py-khoi-dong.01-xin-chao.01-in-loi-chao',
  title: 'In lời chào',
  kind: 'code',
  prompt: 'In ra `Xin chào`',
  starterCode: '# Viết code ở đây\n',
  solution: 'print("Xin chào")\n',
  tests: [{ type: 'stdout_equals', expected: 'Xin chào\n', message: 'Thử lại nhé.' }],
  hints: ['Dùng `print`.', 'Chữ trong ngoặc kép.', 'Ví dụ: `print("Chào bạn")`.'],
  ...overrides,
});

const tree = ({ order = ['01-xin-chao'], lessons } = {}) => [
  {
    dir: 'py-khoi-dong',
    course: {
      id: 'py-khoi-dong',
      title: 'Python khởi động',
      summary: 'Làm quen với Python.',
      ageRange: [10, 15],
      authorId: 'core',
      order,
      status: 'draft',
    },
    lessons: lessons ?? [
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
        markdown: '# Xin chào\n',
        exercises: [{ file: '01-in-loi-chao', data: exercise() }],
      },
    ],
  },
];

describe('buildBundle', () => {
  it('không gửi lời giải xuống trình duyệt', () => {
    const { files } = buildBundle(tree());
    const bundle = files[0].json;
    expect(bundle.exercises[0]).not.toHaveProperty('solution');
    expect(JSON.stringify(files)).not.toContain('print("Xin chào")');
  });

  it('vẫn gửi test và gợi ý, vì việc chấm chạy ngay trong máy', () => {
    const { files } = buildBundle(tree());
    expect(files[0].json.exercises[0].tests).toHaveLength(1);
    expect(files[0].json.exercises[0].hints).toHaveLength(3);
  });

  it('điền mặc định timeoutMs và turtle khi bài tập không ghi', () => {
    const { files } = buildBundle(tree());
    expect(files[0].json.exercises[0].timeoutMs).toBe(5000);
    expect(files[0].json.exercises[0].turtle).toBe(false);
  });

  it('tên file bài học có hash, đổi nội dung thì đổi hash', () => {
    const before = buildBundle(tree()).files[0].path;
    const again = buildBundle(tree()).files[0].path;
    expect(before).toBe(again);
    expect(before).toMatch(/^lessons\/py-khoi-dong\.01-xin-chao\.[0-9a-f]{8}\.json$/);

    const changed = tree();
    changed[0].lessons[0].markdown = '# Nội dung khác\n';
    expect(buildBundle(changed).files[0].path).not.toBe(before);
  });

  it('index trỏ đúng file bài học và kèm số bài tập', () => {
    const { index, files } = buildBundle(tree());
    const lesson = index.courses[0].lessons[0];
    expect(lesson.file).toBe(files[0].path);
    expect(lesson.exerciseCount).toBe(1);
    expect(lesson.hasVideo).toBe(false);
  });

  it('giữ đúng thứ tự bài theo course.order, không theo thứ tự thư mục', () => {
    const lessonTwo = {
      dir: '02-bien',
      lesson: {
        id: 'py-khoi-dong.02-bien',
        title: 'Biến',
        concepts: ['biến'],
        estimatedMinutes: 10,
        exercises: ['01-in-loi-chao'],
        status: 'draft',
      },
      markdown: '# Biến\n',
      exercises: [
        { file: '01-in-loi-chao', data: exercise({ id: 'py-khoi-dong.02-bien.01-in-loi-chao' }) },
      ],
    };
    const input = tree({ order: ['02-bien', '01-xin-chao'] });
    input[0].lessons.push(lessonTwo);
    const { index } = buildBundle(input);
    expect(index.courses[0].lessons.map((lesson) => lesson.slug)).toEqual([
      '02-bien',
      '01-xin-chao',
    ]);
  });

  it('kèm nội dung markdown của bài học', () => {
    const { files } = buildBundle(tree());
    expect(files[0].json.markdown).toBe('# Xin chào\n');
  });
});
