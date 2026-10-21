import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Clock, Dumbbell } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';
import { loadContentIndex } from '../../content/loader';
import type { ContentIndex } from '../../content/types';

type State = { status: 'loading' } | { status: 'ready'; index: ContentIndex } | { status: 'error' };

/**
 * Danh sách bài học đọc từ bundle nội dung. Bản đồ đầy đủ (tiến độ, streak,
 * huy hiệu) là S0-13.
 */
export function MapPage() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    loadContentIndex()
      .then((index) => {
        if (active) setState({ status: 'ready', index });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  const lessons =
    state.status === 'ready' ? state.index.courses.flatMap((course) => course.lessons) : [];

  return (
    <section>
      <h1 className="text-2xl font-bold sm:text-3xl">{vi.map.title}</h1>
      <p className="mt-2 text-ink-muted">{vi.map.lead}</p>

      {state.status === 'loading' && (
        <p className="mt-6 text-ink-muted" role="status">
          {vi.map.loading}
        </p>
      )}
      {state.status === 'error' && (
        <p className="mt-6 text-warn-500" role="alert">
          {vi.map.error}
        </p>
      )}
      {state.status === 'ready' && lessons.length === 0 && (
        <p className="mt-6 text-ink-muted">{vi.map.empty}</p>
      )}

      {lessons.length > 0 && (
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                to={`/bai-hoc/${lesson.id}`}
                className="flex min-h-tap flex-col rounded-2xl border border-line p-4 hover:bg-surface-muted"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{lesson.title}</span>
                  {lesson.status === 'draft' && (
                    <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
                      {vi.map.draftBadge}
                    </span>
                  )}
                </span>
                <span className="mt-2 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Clock aria-hidden="true" className="size-4" />
                    {lesson.estimatedMinutes} {vi.map.minutes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell aria-hidden="true" className="size-4" />
                    {lesson.exerciseCount} {vi.map.exercises}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
