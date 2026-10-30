import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Check, Clock, Dumbbell } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';
import { loadContentIndex } from '../../content/loader';
import type { ContentIndex, LessonSummary } from '../../content/types';
import { useProgress } from '../../progress/useProgress';
import { StreakBanner } from './StreakBanner';

type State = { status: 'loading' } | { status: 'ready'; index: ContentIndex } | { status: 'error' };

/** Bản đồ nhiệm vụ: danh sách bài học kèm tiến độ đã làm trên máy này. */
export function MapPage() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const { doneByLesson, streakDays, badges } = useProgress();

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
  const earnedBadges = badges.filter((badge) => badge.earned).length;

  return (
    <section>
      <h1 className="text-2xl font-bold sm:text-3xl">{vi.map.title}</h1>
      <p className="mt-2 text-ink-soft">{vi.map.lead}</p>

      <div className="mt-4">
        <StreakBanner days={streakDays} />
      </div>

      {earnedBadges > 0 && (
        <Link
          to="/huy-hieu"
          className="mt-3 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {earnedBadges} {vi.badges.countEarned} · {vi.badges.seeAll}
        </Link>
      )}

      {state.status === 'loading' && (
        <p className="mt-6 text-ink-soft" role="status">
          {vi.map.loading}
        </p>
      )}
      {state.status === 'error' && (
        <p className="mt-6 text-attention" role="alert">
          {vi.map.error}
        </p>
      )}
      {state.status === 'ready' && lessons.length === 0 && (
        <p className="mt-6 text-ink-soft">{vi.map.empty}</p>
      )}

      {lessons.length > 0 && (
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <LessonCard
                lesson={lesson}
                order={index + 1}
                done={doneByLesson.get(lesson.id) ?? 0}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function LessonCard({
  lesson,
  order,
  done,
}: {
  lesson: LessonSummary;
  order: number;
  done: number;
}) {
  const finished = done >= lesson.exerciseCount && lesson.exerciseCount > 0;
  return (
    <Link
      to={`/bai-hoc/${lesson.id}`}
      data-testid={`lesson-${lesson.id}`}
      className={[
        'flex min-h-tap flex-col rounded-2xl border p-4 hover:bg-surface-muted',
        finished ? 'border-success/50 bg-success-surface' : 'border-line',
      ].join(' ')}
    >
      <span className="flex items-center gap-2">
        <span
          className={[
            'flex size-8 shrink-0 items-center justify-center rounded-full font-bold',
            finished ? 'bg-success-surface text-success' : 'bg-accent-soft text-accent-strong',
          ].join(' ')}
        >
          {finished ? <Check aria-hidden="true" className="size-5" /> : order}
        </span>
        <span className="font-semibold">{lesson.title}</span>
        {finished && (
          <span className="rounded-full bg-success-surface px-2 py-0.5 text-xs font-medium text-success">
            {vi.map.done}
          </span>
        )}
        {!finished && lesson.status === 'draft' && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong">
            {vi.map.draftBadge}
          </span>
        )}
      </span>

      <span className="mt-2 flex flex-wrap gap-x-4 text-sm text-ink-soft">
        <span className="flex items-center gap-1">
          <Clock aria-hidden="true" className="size-4" />
          {lesson.estimatedMinutes} {vi.map.minutes}
        </span>
        <span className="flex items-center gap-1" data-testid={`progress-${lesson.id}`}>
          <Dumbbell aria-hidden="true" className="size-4" />
          {done}/{lesson.exerciseCount} {vi.map.exercisesDone}
        </span>
      </span>
    </Link>
  );
}
