import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowRight, Check, Clock, PartyPopper } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';
import { loadLesson } from '../../content/loader';
import type { LessonBundle } from '../../content/types';
import { useProgress } from '../../progress/useProgress';
import type { ExerciseStatus } from '../../progress/schema';
import { LessonBody } from './LessonBody';
import { LessonVideo } from './LessonVideo';
import { buttonClasses } from '../../shared/ui/button-classes';

/** Kết quả tải, kèm mã bài để biết nó thuộc về bài nào đang mở. */
type Loaded =
  | { lessonId: string; status: 'ready'; bundle: LessonBundle }
  | { lessonId: string; status: 'not-found' };

/**
 * Màn bài học: đọc nội dung rồi đi thẳng sang bài tập. Trang này **chỉ đọc** —
 * mở bài học không ghi gì vào IndexedDB; màn bài tập mới là chỗ ghi tiến độ.
 */
export function LessonPage() {
  const { lessonId = '' } = useParams();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const { snapshot } = useProgress();

  useEffect(() => {
    let active = true;
    loadLesson(lessonId)
      .then((bundle) => {
        if (active) setLoaded({ lessonId, status: 'ready', bundle });
      })
      .catch(() => {
        if (active) setLoaded({ lessonId, status: 'not-found' });
      });
    return () => {
      active = false;
    };
  }, [lessonId]);

  // Đổi sang bài khác thì kết quả cũ không còn đúng nữa: đang tải bài mới.
  const state = loaded?.lessonId === lessonId ? loaded : null;

  if (state === null) {
    return (
      <p className="text-ink-soft" role="status">
        {vi.lesson.loading}
      </p>
    );
  }

  if (state.status === 'not-found') {
    return (
      <section>
        <h1 className="text-2xl font-bold">{vi.lesson.notFound}</h1>
        <Link
          to="/ban-do"
          className="mt-4 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {vi.lesson.backToMap}
        </Link>
      </section>
    );
  }

  const { lesson, markdown, exercises } = state.bundle;
  const statusOf = new Map<string, ExerciseStatus>(
    (snapshot?.exercises ?? []).map((item) => [item.exerciseId, item.status]),
  );
  const next = exercises.find((exercise) => statusOf.get(exercise.id) !== 'xong');

  return (
    <article className="mx-auto max-w-prose">
      <Link
        to="/ban-do"
        className="inline-flex min-h-tap items-center font-medium text-accent-strong underline"
      >
        {vi.lesson.backToMap}
      </Link>

      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 text-ink-soft">
        <span className="flex items-center gap-1">
          <Clock aria-hidden="true" className="size-4" />
          {lesson.estimatedMinutes} {vi.lesson.minutes}
        </span>
        <span>
          {vi.lesson.conceptsTitle}: {lesson.concepts.join(', ')}
        </span>
      </p>

      {lesson.video && (
        <div className="mt-6">
          <h2 className="sr-only">{vi.lesson.videoTitle}</h2>
          <LessonVideo video={lesson.video} title={lesson.title} />
        </div>
      )}

      <LessonBody markdown={markdown} />

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.lesson.exercisesTitle}</h2>
        <p className="mt-1 text-ink-soft">{vi.lesson.exercisesLead}</p>

        <ol className="mt-4 space-y-2" data-testid="lesson-exercises">
          {exercises.map((exercise, index) => {
            const status = statusOf.get(exercise.id);
            return (
              <li key={exercise.id}>
                <Link
                  to={`/bai-tap/${exercise.id}`}
                  className={[
                    'flex min-h-tap items-center gap-3 rounded-2xl border p-3 hover:bg-surface-muted',
                    status === 'xong' ? 'border-success/50 bg-success-surface' : 'border-line',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex size-8 shrink-0 items-center justify-center rounded-full font-bold',
                      status === 'xong'
                        ? 'bg-success-surface text-success'
                        : 'bg-accent-soft text-accent-strong',
                    ].join(' ')}
                  >
                    {status === 'xong' ? (
                      <Check aria-hidden="true" className="size-5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="font-medium">{exercise.title}</span>
                  {status && (
                    <span className="ml-auto text-sm text-ink-soft">
                      {status === 'xong' ? vi.lesson.exerciseDone : vi.lesson.exerciseDoing}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>

        {next ? (
          <Link
            to={`/bai-tap/${next.id}`}
            data-testid="lesson-cta"
            className={buttonClasses('primary', 'lg', 'mt-6')}
          >
            {next.id === exercises[0]?.id ? vi.lesson.startFirst : vi.lesson.continueNext}
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        ) : (
          <p
            data-testid="lesson-all-done"
            className="mt-6 flex items-center gap-2 rounded-2xl border border-success/50 bg-success-surface p-4 font-medium"
          >
            <PartyPopper aria-hidden="true" className="size-5 shrink-0 text-success" />
            {vi.lesson.allDone}
          </p>
        )}
      </section>
    </article>
  );
}
