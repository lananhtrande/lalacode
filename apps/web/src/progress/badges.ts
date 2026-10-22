import type { ProgressSnapshot } from './schema';
import { currentStreak } from './streak';

/**
 * Sáu huy hiệu đầu. Tất cả đều tính được **chỉ từ tiến độ trên máy**, không
 * cần biết nội dung bài — nhờ vậy huy hiệu không hỏng khi khoá học thay đổi.
 *
 * Nguyên tắc chọn (docs/content-format.md §Giọng văn): khen **nỗ lực và thói
 * quen**, không khen "giỏi"; mốc đầu phải dễ đạt ngay buổi học đầu tiên.
 */

export type BadgeId =
  'bai-dau-tien' | 'nam-bai-tap' | 'xong-bai-hoc' | 'ba-ngay-lien' | 'bay-ngay-lien' | 'kien-tri';

export interface BadgeRule {
  id: BadgeId;
  /** Ngưỡng để hiện thanh tiến trình "còn mấy bước nữa". */
  goal: number;
  /** Đã đi được bao nhiêu phần của mục tiêu. */
  progress: (snapshot: ProgressSnapshot, today: string) => number;
}

const doneExercises = (snapshot: ProgressSnapshot) =>
  snapshot.exercises.filter((exercise) => exercise.status === 'xong');

export const BADGE_RULES: BadgeRule[] = [
  {
    id: 'bai-dau-tien',
    goal: 1,
    progress: (snapshot) => doneExercises(snapshot).length,
  },
  {
    id: 'nam-bai-tap',
    goal: 5,
    progress: (snapshot) => doneExercises(snapshot).length,
  },
  {
    id: 'xong-bai-hoc',
    goal: 1,
    progress: (snapshot) =>
      snapshot.lessons.filter((lesson) => lesson.completedAt !== undefined).length,
  },
  {
    id: 'ba-ngay-lien',
    goal: 3,
    progress: (snapshot, today) =>
      currentStreak(
        snapshot.profile.lastActiveDay === undefined
          ? { streakDays: snapshot.profile.streakDays }
          : {
              streakDays: snapshot.profile.streakDays,
              lastActiveDay: snapshot.profile.lastActiveDay,
            },
        today,
      ),
  },
  {
    id: 'bay-ngay-lien',
    goal: 7,
    progress: (snapshot, today) =>
      currentStreak(
        snapshot.profile.lastActiveDay === undefined
          ? { streakDays: snapshot.profile.streakDays }
          : {
              streakDays: snapshot.profile.streakDays,
              lastActiveDay: snapshot.profile.lastActiveDay,
            },
        today,
      ),
  },
  {
    id: 'kien-tri',
    goal: 1,
    // Làm đạt sau nhiều lần thử — đúng tinh thần "khen nỗ lực".
    progress: (snapshot) =>
      doneExercises(snapshot).filter((exercise) => exercise.attempts >= 5).length,
  },
];

export interface BadgeState {
  id: BadgeId;
  earned: boolean;
  progress: number;
  goal: number;
}

export function evaluateBadges(snapshot: ProgressSnapshot, today: string): BadgeState[] {
  return BADGE_RULES.map((rule) => {
    const progress = Math.min(rule.goal, rule.progress(snapshot, today));
    return { id: rule.id, earned: progress >= rule.goal, progress, goal: rule.goal };
  });
}

/**
 * Huy hiệu **chỉ được thêm, không bị lấy lại**: streak đứt thì trẻ mất chuỗi
 * ngày, nhưng huy hiệu đã nhận vẫn còn — lấy lại phần thưởng đã trao là cách
 * nhanh nhất làm trẻ bỏ cuộc.
 */
export function mergeEarnedBadges(
  saved: readonly string[],
  states: readonly BadgeState[],
): string[] {
  const earned = new Set(saved);
  for (const state of states) if (state.earned) earned.add(state.id);
  return [...earned];
}
