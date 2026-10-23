import type { ZodType } from 'zod';
import { courseSchema, exerciseSchema, lessonSchema } from './schema.ts';
import { exerciseId, lessonId } from './ids.ts';

/**
 * Kiểm tra toàn bộ cây nội dung. Hàm thuần: nhận dữ liệu đã đọc sẵn, trả về danh
 * sách vấn đề — không đụng tới ổ đĩa, nên dễ unit test.
 */

export interface ExerciseFileInput {
  /** Tên file bỏ đuôi `.json`, ví dụ `01-in-loi-chao`. */
  file: string;
  data: unknown;
}

export interface LessonDirInput {
  /** Tên thư mục bài học, ví dụ `01-xin-chao`. */
  dir: string;
  lesson: unknown;
  /** Nội dung `lesson.md`; `null` nghĩa là thiếu file. */
  markdown: string | null;
  exercises: ExerciseFileInput[];
}

export interface CourseDirInput {
  /** Tên thư mục khoá học, ví dụ `py-khoi-dong`. */
  dir: string;
  course: unknown;
  lessons: LessonDirInput[];
}

export type IssueLevel = 'error' | 'warning';

export interface Issue {
  level: IssueLevel;
  /** Đường dẫn file, kèm trường bị lỗi nếu có: `.../lesson.json → exercises[0]`. */
  where: string;
  message: string;
}

function schemaIssues(schema: ZodType, data: unknown, where: string): Issue[] {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    level: 'error' as const,
    where: issue.path.length ? `${where} → ${formatPath(issue.path)}` : where,
    message: issue.message,
  }));
}

function formatPath(path: readonly PropertyKey[]): string {
  return path
    .map((part) => (typeof part === 'number' ? `[${part}]` : String(part)))
    .join('.')
    .replace(/\.\[/g, '[');
}

/** Phần tử có mặt ở `expected` nhưng thiếu ở `actual`, và ngược lại. */
function compareLists(
  expected: readonly string[],
  actual: readonly string[],
): { missing: string[]; extra: string[]; duplicated: string[] } {
  const seen = new Set<string>();
  const duplicated: string[] = [];
  for (const item of expected) {
    if (seen.has(item)) duplicated.push(item);
    seen.add(item);
  }
  return {
    missing: expected.filter((item) => !actual.includes(item)),
    extra: actual.filter((item) => !expected.includes(item)),
    duplicated,
  };
}

/**
 * Màn bài học render Markdown bằng `react-markdown`, **không** bật HTML thô và
 * cố ý không nhận ảnh. Hai thứ dưới đây mà lọt vào bài thì ở `npm run dev`
 * trông vẫn ổn nhưng lên bản thật sẽ im lặng biến mất (HTML) hoặc bị CSP chặn
 * (ảnh ngoài). Thà báo lỗi ngay lúc viết bài còn hơn để người viết tưởng xong.
 */
function markdownSubsetIssues(markdown: string, where: string): Issue[] {
  const issues: Issue[] = [];
  // Bỏ khối code trước khi soi, kẻo ví dụ dạy HTML lại bị báo lỗi.
  const prose = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

  if (/!\[[^\]]*\]\(/.test(prose)) {
    issues.push({
      level: 'error',
      where,
      message: 'Bài học chưa hỗ trợ ảnh trong Markdown. Dùng `turtle` hoặc mô tả bằng chữ.',
    });
  }
  const tag = /<\/?[a-zA-Z][^>]*>/.exec(prose);
  if (tag) {
    issues.push({
      level: 'error',
      where,
      message: `Thẻ HTML \`${tag[0]}\` sẽ không hiện ra gì cả — viết bằng Markdown thuần.`,
    });
  }
  return issues;
}

export function validateCourseTree(courses: readonly CourseDirInput[]): Issue[] {
  const issues: Issue[] = [];
  if (courses.length === 0) {
    issues.push({ level: 'warning', where: 'content/courses', message: 'Chưa có khoá học nào.' });
  }

  for (const courseDir of courses) {
    const courseWhere = `content/courses/${courseDir.dir}/course.json`;
    const courseResult = courseSchema.safeParse(courseDir.course);
    issues.push(...schemaIssues(courseSchema, courseDir.course, courseWhere));
    if (!courseResult.success) continue;
    const course = courseResult.data;

    if (course.id !== courseDir.dir) {
      issues.push({
        level: 'error',
        where: `${courseWhere} → id`,
        message: `\`id\` phải trùng tên thư mục: cần \`${courseDir.dir}\`, đang là \`${course.id}\`.`,
      });
    }

    const lessonDirs = courseDir.lessons.map((lesson) => lesson.dir);
    const orderCheck = compareLists(course.order, lessonDirs);
    for (const dir of orderCheck.missing) {
      issues.push({
        level: 'error',
        where: `${courseWhere} → order`,
        message: `\`order\` nhắc tới bài \`${dir}\` nhưng không có thư mục đó.`,
      });
    }
    for (const dir of orderCheck.extra) {
      issues.push({
        level: 'error',
        where: `${courseWhere} → order`,
        message: `Thư mục bài \`${dir}\` chưa được liệt kê trong \`order\`.`,
      });
    }
    for (const dir of orderCheck.duplicated) {
      issues.push({
        level: 'error',
        where: `${courseWhere} → order`,
        message: `Bài \`${dir}\` bị liệt kê hai lần trong \`order\`.`,
      });
    }

    for (const lessonDir of courseDir.lessons) {
      const base = `content/courses/${courseDir.dir}/lessons/${lessonDir.dir}`;
      const lessonWhere = `${base}/lesson.json`;
      const lessonResult = lessonSchema.safeParse(lessonDir.lesson);
      issues.push(...schemaIssues(lessonSchema, lessonDir.lesson, lessonWhere));

      if (lessonDir.markdown === null) {
        issues.push({
          level: 'error',
          where: `${base}/lesson.md`,
          message: 'Thiếu file `lesson.md`.',
        });
      } else if (lessonDir.markdown.trim() === '') {
        issues.push({
          level: 'error',
          where: `${base}/lesson.md`,
          message: 'File `lesson.md` rỗng.',
        });
      } else {
        issues.push(...markdownSubsetIssues(lessonDir.markdown, `${base}/lesson.md`));
      }

      if (!lessonResult.success) continue;
      const lesson = lessonResult.data;
      // Đường dẫn là nguồn sự thật: nếu `course.id` sai thì lỗi đó đã được báo riêng.
      const expectedLessonId = lessonId(courseDir.dir, lessonDir.dir);
      if (lesson.id !== expectedLessonId) {
        issues.push({
          level: 'error',
          where: `${lessonWhere} → id`,
          message: `\`id\` phải là \`${expectedLessonId}\`, đang là \`${lesson.id}\`.`,
        });
      }

      if (course.status === 'published' && lesson.status !== 'published') {
        issues.push({
          level: 'warning',
          where: lessonWhere,
          message: 'Khoá đã `published` nhưng bài này vẫn `draft`.',
        });
      }

      const exerciseFiles = lessonDir.exercises.map((exercise) => exercise.file);
      const exerciseCheck = compareLists(lesson.exercises, exerciseFiles);
      for (const file of exerciseCheck.missing) {
        issues.push({
          level: 'error',
          where: `${lessonWhere} → exercises`,
          message: `Nhắc tới bài tập \`${file}\` nhưng không có file \`exercises/${file}.json\`.`,
        });
      }
      for (const file of exerciseCheck.extra) {
        issues.push({
          level: 'error',
          where: `${lessonWhere} → exercises`,
          message: `File \`exercises/${file}.json\` chưa được liệt kê trong \`exercises\`.`,
        });
      }
      for (const file of exerciseCheck.duplicated) {
        issues.push({
          level: 'error',
          where: `${lessonWhere} → exercises`,
          message: `Bài tập \`${file}\` bị liệt kê hai lần.`,
        });
      }

      if (lesson.status === 'published' && lesson.exercises.length < 3) {
        issues.push({
          level: 'warning',
          where: `${lessonWhere} → exercises`,
          message: 'Bài đã `published` nên có 3–5 bài tập (xem docs/content-format.md).',
        });
      }

      for (const exerciseFile of lessonDir.exercises) {
        const exerciseWhere = `${base}/exercises/${exerciseFile.file}.json`;
        const exerciseResult = exerciseSchema.safeParse(exerciseFile.data);
        issues.push(...schemaIssues(exerciseSchema, exerciseFile.data, exerciseWhere));
        if (!exerciseResult.success) continue;
        const exercise = exerciseResult.data;

        const expectedExerciseId = exerciseId(expectedLessonId, exerciseFile.file);
        if (exercise.id !== expectedExerciseId) {
          issues.push({
            level: 'error',
            where: `${exerciseWhere} → id`,
            message: `\`id\` phải là \`${expectedExerciseId}\`, đang là \`${exercise.id}\`.`,
          });
        }

        // Luật sư phạm: gợi ý không được là lời giải (CLAUDE.md §4).
        const solution = exercise.solution.trim();
        if (solution.length >= 10) {
          exercise.hints.forEach((hint, index) => {
            if (hint.includes(solution)) {
              issues.push({
                level: 'error',
                where: `${exerciseWhere} → hints[${index}]`,
                message: 'Gợi ý chứa nguyên lời giải — hãy đổi thành ví dụ tương tự.',
              });
            }
          });
        }

        if (exercise.turtle && !exercise.solution.includes('turtle')) {
          issues.push({
            level: 'warning',
            where: `${exerciseWhere} → turtle`,
            message: 'Đánh dấu `turtle: true` nhưng lời giải không dùng `turtle`.',
          });
        }
      }
    }
  }

  return issues;
}
