// Biến cây nội dung thành bundle JSON cho trình duyệt.
// Hàm thuần: nhận dữ liệu đã đọc, trả về các file sẽ ghi — dễ unit test.
import { createHash } from 'node:crypto';
import { exerciseSchema } from '@lalacode/content-schema';

export const BUNDLE_VERSION = 1;

/** Tên file bài học mang hash nội dung nên có thể cache vĩnh viễn. */
function hashOf(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 8);
}

/**
 * Bài tập gửi xuống trình duyệt **không có `solution`**: trẻ mở devtools là
 * thấy đáp án. Test thì vẫn phải gửi, vì việc chấm chạy ngay trong máy
 * (docs/architecture.md).
 */
function publicExercise(exercise) {
  // Parse để điền mặc định (timeoutMs, turtle) — nội dung đã được kiểm tra
  // trước khi tới đây, nên `parse` ném lỗi là lỗi lập trình, không phải lỗi dữ liệu.
  const { solution: _solution, ...rest } = exerciseSchema.parse(exercise);
  return rest;
}

/**
 * @returns {{ index: object, files: Array<{path: string, json: object}> }}
 *   `path` tính từ thư mục content công khai.
 */
export function buildBundle(courses) {
  const files = [];
  const indexCourses = [];

  for (const course of courses) {
    const lessons = [];
    for (const lessonDir of course.lessons) {
      const lesson = lessonDir.lesson;
      const exercises = lessonDir.exercises.map((entry) => publicExercise(entry.data));
      const bundle = {
        version: BUNDLE_VERSION,
        lesson,
        markdown: lessonDir.markdown ?? '',
        exercises,
      };
      // JSON ổn định (khoá theo thứ tự chèn) → cùng nội dung thì cùng hash.
      const json = JSON.stringify(bundle);
      const file = `lessons/${lesson.id}.${hashOf(json)}.json`;
      files.push({ path: file, json: bundle });

      lessons.push({
        id: lesson.id,
        slug: lessonDir.dir,
        title: lesson.title,
        concepts: lesson.concepts,
        estimatedMinutes: lesson.estimatedMinutes,
        status: lesson.status,
        exerciseCount: exercises.length,
        hasVideo: Boolean(lesson.video),
        file,
      });
    }

    indexCourses.push({
      id: course.course.id,
      title: course.course.title,
      summary: course.course.summary,
      ageRange: course.course.ageRange,
      status: course.course.status,
      // Giữ đúng thứ tự trong course.order, bỏ qua bài không tìm thấy
      // (content:check đã báo lỗi trường hợp đó rồi).
      lessons: course.course.order
        .map((slug) => lessons.find((lesson) => lesson.slug === slug))
        .filter((lesson) => lesson !== undefined),
    });
  }

  return { index: { version: BUNDLE_VERSION, courses: indexCourses }, files };
}
