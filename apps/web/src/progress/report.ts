import type { ContentIndex } from '../content/types';
import type { SharedProgress } from './share-code';
import { currentStreak } from './streak';

/**
 * Tóm tắt tiến độ cho **bố mẹ đọc**. Hàm thuần: nhận tiến độ đã giải mã và mục
 * lục nội dung, trả về số liệu — không đụng mạng, không đụng ổ đĩa.
 *
 * Chỉ số liệu. **Không có code của trẻ ở đây** (mã tiến độ vốn không mang
 * `draftCode`), và cũng không có tên thật vì mình không bao giờ hỏi.
 */

export interface LessonReport {
  lessonId: string;
  title: string;
  doneCount: number;
  totalCount: number;
  completed: boolean;
}

export interface ProgressReport {
  exercisesDone: number;
  lessonsCompleted: number;
  lessonsStarted: number;
  streakDays: number;
  badgeCount: number;
  /** `YYYY-MM-DD`, hoặc rỗng nếu chưa học buổi nào. */
  lastActiveDay: string;
  /** Tổng số lần trẻ bấm "Nộp bài" — cho thấy sự kiên trì, không phải điểm số. */
  attempts: number;
  lessons: LessonReport[];
}

export function summarizeProgress(
  progress: SharedProgress,
  index: ContentIndex | null,
  today: string,
): ProgressReport {
  const doneByLesson = new Map<string, number>();
  let exercisesDone = 0;
  let attempts = 0;

  for (const exercise of progress.exercises) {
    attempts += exercise.attempts;
    if (exercise.status !== 'xong') continue;
    exercisesDone += 1;
    doneByLesson.set(exercise.lessonId, (doneByLesson.get(exercise.lessonId) ?? 0) + 1);
  }

  const completedLessons = new Set(
    progress.lessons.filter((lesson) => lesson.completedAt !== undefined).map((l) => l.lessonId),
  );

  // Mục lục cho biết tên bài và tổng số bài tập; thiếu mục lục thì vẫn báo cáo được.
  const lessons: LessonReport[] = (index?.courses ?? [])
    .flatMap((course) => course.lessons)
    .filter((lesson) => doneByLesson.has(lesson.id) || completedLessons.has(lesson.id))
    .map((lesson) => ({
      lessonId: lesson.id,
      title: lesson.title,
      doneCount: doneByLesson.get(lesson.id) ?? 0,
      totalCount: lesson.exerciseCount,
      completed: completedLessons.has(lesson.id),
    }));

  return {
    exercisesDone,
    lessonsCompleted: completedLessons.size,
    lessonsStarted: progress.lessons.length,
    streakDays: currentStreak(
      progress.profile.lastActiveDay === undefined
        ? { streakDays: progress.profile.streakDays }
        : {
            streakDays: progress.profile.streakDays,
            lastActiveDay: progress.profile.lastActiveDay,
          },
      today,
    ),
    badgeCount: progress.profile.badges.length,
    lastActiveDay: progress.profile.lastActiveDay ?? '',
    attempts,
    lessons,
  };
}

/** `2026-03-05` → `05/03/2026`, kiểu ngày quen thuộc ở Việt Nam. */
export function formatDayVi(day: string): string {
  const [year, month, date] = day.split('-');
  if (!year || !month || !date) return day;
  return `${date}/${month}/${year}`;
}
