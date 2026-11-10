import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowRight, Check, Clock, PartyPopper } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';
import { loadContentIndex, loadLesson } from '../../content/loader';
import { lessonNeighbours, type Neighbours } from '../../content/navigation';
import type { LessonBundle } from '../../content/types';
import { useProgress } from '../../progress/useProgress';
import type { ExerciseStatus } from '../../progress/schema';
import { LessonBody, stripLeadingTitle } from './LessonBody';
import { LessonContents, useActiveHeading } from './LessonContents';
import { lessonOutline } from '../../content/outline';
import type { ContentIndex } from '../../content/types';
import { LessonVideo } from './LessonVideo';
import { buttonClasses } from '../../shared/ui/button-classes';
import { NeighbourLinks } from '../../shared/ui/NeighbourLinks';
import { toNeighbourLink } from '../../shared/ui/neighbour-link';

/** Kết quả tải, kèm mã bài để biết nó thuộc về bài nào đang mở. */
type Loaded =
  | {
      lessonId: string;
      status: 'ready';
      bundle: LessonBundle;
      neighbours: Neighbours | null;
      /** "Chương 2 · Ra quyết định và lặp lại"; `null` khi không tải được index. */
      chapterLabel: string | null;
    }
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
    // Index đã nằm trong bộ nhớ (loadLesson cần nó), nên không tốn thêm request.
    // Không có index thì chỉ thiếu nút bài trước/tiếp, bài học vẫn đọc được.
    Promise.all([loadLesson(lessonId), loadContentIndex().catch(() => null)])
      .then(([bundle, index]) => {
        if (active) {
          setLoaded({
            lessonId,
            status: 'ready',
            bundle,
            neighbours: index && lessonNeighbours(index, lessonId),
            chapterLabel: index && chapterLabelOf(index, lessonId),
          });
        }
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
  const body = state?.status === 'ready' ? stripLeadingTitle(state.bundle.markdown) : '';
  const outline = useMemo(() => lessonOutline(body), [body]);
  const activeHeading = useActiveHeading(outline.map((item) => item.id));

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
        <h1 className="text-page-title">{vi.lesson.notFound}</h1>
        <Link
          to="/khoa-hoc"
          className="mt-4 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {vi.lesson.backToCatalog}
        </Link>
      </section>
    );
  }

  const { lesson, exercises } = state.bundle;
  const { neighbours, chapterLabel } = state;
  // Một mục thì không cần mục lục.
  const showContents = outline.length >= 2;
  const statusOf = new Map<string, ExerciseStatus>(
    (snapshot?.exercises ?? []).map((item) => [item.exerciseId, item.status]),
  );
  const next = exercises.find((exercise) => statusOf.get(exercise.id) !== 'xong');

  return (
    <div className="mx-auto flex w-full max-w-[66rem] justify-center gap-10">
      <article className="w-full max-w-[45rem] min-w-0 rounded-card border border-line bg-surface p-5 sm:p-8">
        {chapterLabel && (
          <p
            className="text-small font-semibold tracking-wide text-ink-soft uppercase"
            data-testid="chapter-label"
          >
            {chapterLabel}
          </p>
        )}
        <h1 className="mt-1 text-page-title">{lesson.title}</h1>
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

        {showContents && (
          <LessonContents
            outline={outline}
            className="mt-6 rounded-card border border-line p-4 xl:hidden"
          />
        )}

        <LessonBody markdown={body} outline={outline} />

        <section className="mt-10">
          <h2 className="text-section-title">{vi.lesson.exercisesTitle}</h2>
          <p className="mt-1 text-ink-soft">{vi.lesson.exercisesLead}</p>

          <ol className="mt-4 space-y-2" data-testid="lesson-exercises">
            {exercises.map((exercise, index) => {
              const status = statusOf.get(exercise.id);
              return (
                <li key={exercise.id}>
                  <Link
                    to={`/bai-tap/${exercise.id}`}
                    className={[
                      'flex min-h-tap items-center gap-3 rounded-card border p-3 hover:bg-surface-muted',
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
                      <span className="ml-auto text-small text-ink-soft">
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
              className="mt-6 flex items-center gap-2 rounded-card border border-success/50 bg-success-surface p-4 font-medium"
            >
              <PartyPopper aria-hidden="true" className="size-5 shrink-0 text-success" />
              {vi.lesson.allDone}
            </p>
          )}
        </section>

        {neighbours && (
          <NeighbourLinks
            label={vi.pager.label}
            previous={
              neighbours.previous && toNeighbourLink(neighbours.previous, 'previous', 'lesson')
            }
            next={toNeighbourLink(neighbours.next, 'next', 'lesson')}
            // Xong hết bài tập thì đi tiếp là việc chính; chưa xong thì nút chính vẫn là "làm tiếp".
            nextIsPrimary={next === undefined}
            className="mt-10 border-t border-line pt-6"
          />
        )}
      </article>
      {showContents && (
        <aside className="hidden w-56 shrink-0 xl:block">
          <LessonContents outline={outline} activeId={activeHeading} className="sticky top-20" />
        </aside>
      )}
    </div>
  );
}

function chapterLabelOf(index: ContentIndex, lessonId: string): string | null {
  for (const course of index.courses) {
    const position = course.chapters.findIndex((chapter) => chapter.lessonIds.includes(lessonId));
    const chapter = course.chapters[position];
    if (chapter) return `${vi.course.chapter} ${position + 1} · ${chapter.title}`;
  }
  return null;
}
