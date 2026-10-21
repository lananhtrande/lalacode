import { describe, expect, it } from 'vitest';
import { courseSchema, exerciseSchema, lessonSchema, videoSchema } from './schema.ts';

const validExercise = {
  id: 'py-khoi-dong.01-xin-chao.01-in-loi-chao',
  title: 'In lời chào',
  kind: 'code',
  prompt: 'In ra dòng chữ `Xin chào`',
  starterCode: '# Viết code ở đây\n',
  solution: 'print("Xin chào")\n',
  tests: [{ type: 'stdout_equals', expected: 'Xin chào\n', message: 'Thử lại nhé.' }],
  hints: ['Dùng `print`.', 'Chữ nằm trong ngoặc kép.', 'Ví dụ: `print("Chào bạn")`.'],
};

describe('exerciseSchema', () => {
  it('nhận bài tập hợp lệ và điền mặc định cho timeoutMs/turtle', () => {
    const result = exerciseSchema.parse(validExercise);
    expect(result.timeoutMs).toBe(5000);
    expect(result.turtle).toBe(false);
  });

  it('bắt buộc đúng 3 gợi ý', () => {
    const result = exerciseSchema.safeParse({ ...validExercise, hints: ['Một', 'Hai'] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('đúng 3 gợi ý');
  });

  it('từ chối prompt dài quá 400 ký tự', () => {
    const result = exerciseSchema.safeParse({ ...validExercise, prompt: 'a'.repeat(401) });
    expect(result.success).toBe(false);
  });

  it('từ chối starterCode dài quá 20 dòng', () => {
    const result = exerciseSchema.safeParse({
      ...validExercise,
      starterCode: Array.from({ length: 21 }, (_, i) => `# dòng ${i}`).join('\n'),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('20 dòng');
  });

  it('từ chối trường lạ (gõ sai tên trường)', () => {
    const result = exerciseSchema.safeParse({ ...validExercise, startedCode: 'x' });
    expect(result.success).toBe(false);
  });

  it('từ chối timeout quá 10 giây', () => {
    const result = exerciseSchema.safeParse({ ...validExercise, timeoutMs: 20_000 });
    expect(result.success).toBe(false);
  });

  it('nhận đủ 5 loại test', () => {
    const tests = [
      { type: 'stdout_equals', expected: 'a\n', message: 'm' },
      { type: 'stdout_contains', expected: 'a', stdin: '5\n', message: 'm' },
      { type: 'variable_equals', name: 'diem', expected: 10, message: 'm' },
      { type: 'function_returns', name: 'cong', args: [1, 2], expected: 3, message: 'm' },
      { type: 'python_assert', code: 'assert diem > 0', message: 'm' },
    ];
    expect(exerciseSchema.safeParse({ ...validExercise, tests }).success).toBe(true);
  });

  it('từ chối loại test không có trong danh sách', () => {
    const result = exerciseSchema.safeParse({
      ...validExercise,
      tests: [{ type: 'stdout_regex', expected: 'a', message: 'm' }],
    });
    expect(result.success).toBe(false);
  });

  it('từ chối tên biến không hợp lệ trong Python', () => {
    const result = exerciseSchema.safeParse({
      ...validExercise,
      tests: [{ type: 'variable_equals', name: '2diem', expected: 1, message: 'm' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('lessonSchema', () => {
  const validLesson = {
    id: 'py-khoi-dong.01-xin-chao',
    title: 'Xin chào, Python!',
    concepts: ['print'],
    estimatedMinutes: 10,
    exercises: ['01-in-loi-chao'],
    status: 'draft',
  };

  it('nhận bài học hợp lệ, video là tuỳ chọn', () => {
    expect(lessonSchema.safeParse(validLesson).success).toBe(true);
  });

  it('từ chối tên thư mục bài tập sai dạng', () => {
    const result = lessonSchema.safeParse({ ...validLesson, exercises: ['in-loi-chao'] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('01-ten-ngan');
  });

  it('từ chối quá 5 khái niệm cho một bài', () => {
    const concepts = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(lessonSchema.safeParse({ ...validLesson, concepts }).success).toBe(false);
  });
});

describe('videoSchema', () => {
  it('youtube-nocookie cần mã 11 ký tự', () => {
    const ok = videoSchema.safeParse({
      provider: 'youtube-nocookie',
      videoId: 'abcdefghijk',
      durationSec: 300,
    });
    expect(ok.success).toBe(true);
    const bad = videoSchema.safeParse({
      provider: 'youtube-nocookie',
      videoId: 'ngan',
      durationSec: 300,
    });
    expect(bad.success).toBe(false);
  });

  it('hls cần đường dẫn bắt đầu bằng /', () => {
    const bad = videoSchema.safeParse({
      provider: 'hls',
      src: 'https://ngoai-mien.example/video.m3u8',
      durationSec: 300,
    });
    expect(bad.success).toBe(false);
  });

  it('từ chối nhà cung cấp khác (ví dụ youtube thường)', () => {
    const result = videoSchema.safeParse({ provider: 'youtube', videoId: 'abcdefghijk' });
    expect(result.success).toBe(false);
  });
});

describe('courseSchema', () => {
  const validCourse = {
    id: 'py-khoi-dong',
    title: 'Python khởi động',
    summary: 'Làm quen với Python.',
    ageRange: [10, 15],
    authorId: 'core',
    order: ['01-xin-chao'],
    status: 'draft',
  };

  it('nhận khoá học hợp lệ', () => {
    expect(courseSchema.safeParse(validCourse).success).toBe(true);
  });

  it('từ chối khoảng tuổi ngược', () => {
    const result = courseSchema.safeParse({ ...validCourse, ageRange: [15, 10] });
    expect(result.success).toBe(false);
  });
});
