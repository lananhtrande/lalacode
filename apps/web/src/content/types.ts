import type { CourseLevel, Difficulty, Exercise, Lesson } from '@lalakode/content-schema';

/**
 * Kiểu của bundle do `scripts/content-build.mjs` sinh ra.
 * Chỉ import **type** từ content-schema: zod không đi vào bundle trình duyệt.
 */

/** Bài tập gửi xuống máy trẻ: giống `Exercise` nhưng không có lời giải. */
export type PublicExercise = Omit<Exercise, 'solution'>;

export interface ExerciseSummary {
  id: string;
  title: string;
  difficulty?: Difficulty;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  concepts: readonly string[];
  estimatedMinutes: number;
  /** Chủ đề để lọc ở kho luyện tập. */
  tags: readonly string[];
  status: Lesson['status'];
  exerciseCount: number;
  /** Đúng thứ tự `lesson.exercises`; chỉ tên, không có đề hay test. */
  exercises: readonly ExerciseSummary[];
  hasVideo: boolean;
  /** Đường dẫn tương đối tới file bài học, có hash nên cache được vĩnh viễn. */
  file: string;
}

export interface ChapterSummary {
  id: string;
  title: string;
  /** Mã đầy đủ của các bài trong chương, đúng thứ tự `order` của khoá. */
  lessonIds: readonly string[];
}

export interface CourseSummary {
  id: string;
  title: string;
  summary: string;
  ageRange: readonly [number, number];
  level: CourseLevel;
  tags: readonly string[];
  /** Tên file trong `public/illustrations/`. */
  illustration: string;
  status: Lesson['status'];
  chapters: readonly ChapterSummary[];
  lessons: readonly LessonSummary[];
}

export interface ContentIndex {
  version: number;
  courses: readonly CourseSummary[];
}

export interface LessonBundle {
  version: number;
  lesson: Lesson;
  markdown: string;
  exercises: readonly PublicExercise[];
}
