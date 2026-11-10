import { useEffect, useMemo, useState } from 'react';
import { loadContentIndex } from '../../content/loader';
import { courseProgress, type CourseProgress } from '../../content/catalog';
import type { ContentIndex, CourseSummary } from '../../content/types';
import { useProgress, type ProgressView } from '../../progress/useProgress';

export interface CourseWithProgress {
  course: CourseSummary;
  progress: CourseProgress;
}

export type CoursesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; courses: CourseWithProgress[] };

/**
 * Danh sách khoá học kèm tiến độ trên máy này (catalog, trang khoá, trang chủ).
 * Tiến độ chưa đọc xong thì coi như chưa học: màn hình hiện ngay, số liệu tới sau.
 */
export function useCourses(): CoursesState & { progress: ProgressView } {
  const [index, setIndex] = useState<ContentIndex | 'loading' | 'error'>('loading');
  const progress = useProgress();

  useEffect(() => {
    let active = true;
    loadContentIndex()
      .then((value) => {
        if (active) setIndex(value);
      })
      .catch(() => {
        if (active) setIndex('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const state = useMemo<CoursesState>(() => {
    if (index === 'loading') return { status: 'loading' };
    if (index === 'error') return { status: 'error' };
    return {
      status: 'ready',
      courses: index.courses.map((course) => ({
        course,
        progress: courseProgress(course, progress.doneByLesson),
      })),
    };
  }, [index, progress.doneByLesson]);

  return { ...state, progress };
}
