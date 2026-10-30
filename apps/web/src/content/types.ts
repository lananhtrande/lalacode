import type { Exercise, Lesson } from '@lalakode/content-schema';

/**
 * Kiểu của bundle do `scripts/content-build.mjs` sinh ra.
 * Chỉ import **type** từ content-schema: zod không đi vào bundle trình duyệt.
 */

/** Bài tập gửi xuống máy trẻ: giống `Exercise` nhưng không có lời giải. */
export type PublicExercise = Omit<Exercise, 'solution'>;

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  concepts: readonly string[];
  estimatedMinutes: number;
  status: Lesson['status'];
  exerciseCount: number;
  hasVideo: boolean;
  /** Đường dẫn tương đối tới file bài học, có hash nên cache được vĩnh viễn. */
  file: string;
}

export interface CourseSummary {
  id: string;
  title: string;
  summary: string;
  ageRange: readonly [number, number];
  status: Lesson['status'];
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
