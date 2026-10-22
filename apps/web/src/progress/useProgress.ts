import { useEffect, useState } from 'react';
import { exportSnapshot, quietly } from './db';
import type { ProgressSnapshot } from './schema';
import { dayKey } from './streak';
import { evaluateBadges, type BadgeState } from './badges';

export interface ProgressView {
  loading: boolean;
  snapshot: ProgressSnapshot | null;
  badges: BadgeState[];
  /** Số bài tập đã xong, theo mã bài học. */
  doneByLesson: Map<string, number>;
  streakDays: number;
}

const empty: ProgressView = {
  loading: true,
  snapshot: null,
  badges: [],
  doneByLesson: new Map(),
  streakDays: 0,
};

/**
 * Đọc tiến độ trên máy cho các màn chỉ hiển thị (bản đồ, huy hiệu).
 * Không lưu được (Safari riêng tư…) thì coi như chưa có tiến độ — màn hình vẫn
 * dùng được, chỉ là không có số liệu.
 */
export function useProgress(today: string = dayKey(new Date())): ProgressView {
  const [view, setView] = useState<ProgressView>(empty);

  useEffect(() => {
    let active = true;
    void quietly(() => exportSnapshot()).then((snapshot) => {
      if (!active) return;
      if (!snapshot) {
        setView({ ...empty, loading: false });
        return;
      }
      const doneByLesson = new Map<string, number>();
      for (const exercise of snapshot.exercises) {
        if (exercise.status !== 'xong') continue;
        doneByLesson.set(exercise.lessonId, (doneByLesson.get(exercise.lessonId) ?? 0) + 1);
      }
      setView({
        loading: false,
        snapshot,
        badges: evaluateBadges(snapshot, today),
        doneByLesson,
        streakDays: snapshot.profile.streakDays,
      });
    });
    return () => {
      active = false;
    };
  }, [today]);

  return view;
}
