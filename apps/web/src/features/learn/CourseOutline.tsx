import { useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router';
import { BookOpen, Check, Circle, Clapperboard, SquareTerminal } from 'lucide-react';
import type { CourseProgress } from '../../content/catalog';
import { vi } from '../../shared/i18n/vi';

export interface CourseOutlineProps {
  progress: CourseProgress;
  currentLessonId: string;
  /** `undefined` khi đang ở trang bài học (chưa vào bài tập nào). */
  currentExerciseId: string | undefined;
  doneExerciseIds: ReadonlySet<string>;
  /** Bấm một mục (để đóng ngăn kéo trên màn hẹp). */
  onNavigate?: (() => void) | undefined;
}

/**
 * Mục lục khoá trong sidebar tối của trình học bài (S0-38): chương dạng
 * accordion, mỗi bài học có một dòng "phần học" và các dòng bài tập. Mục đang
 * mở có `aria-current="page"` và tự cuộn vào tầm nhìn.
 */
export function CourseOutline({
  progress,
  currentLessonId,
  currentExerciseId,
  doneExerciseIds,
  onNavigate,
}: CourseOutlineProps) {
  const currentRef = useRef<HTMLAnchorElement | null>(null);
  const currentPath = currentExerciseId ?? currentLessonId;

  useEffect(() => {
    // `nearest`: chỉ cuộn khi mục đang mở bị khuất, không giật cả trang.
    currentRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [currentPath]);

  return (
    <div className="space-y-1">
      {progress.chapters.map((chapter) => {
        const open = chapter.lessons.some((view) => view.lesson.id === currentLessonId);
        return (
          <details
            key={chapter.chapter.id}
            // Sang bài thuộc chương khác thì chương đó tự mở ra, chương cũ đóng lại.
            open={open}
            data-testid={`outline-${chapter.chapter.id}`}
            className="group"
          >
            <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-learn-hover [&::-webkit-details-marker]:hidden">
              <span className="text-meta tracking-wide text-learn-text uppercase">
                {vi.course.chapter} {chapter.number} · {chapter.chapter.title}
              </span>
              <span className="shrink-0 text-small text-learn-muted">
                {chapter.doneLessons}/{chapter.lessons.length}
              </span>
            </summary>
            <ol className="mt-1 mb-3 space-y-3">
              {chapter.lessons.map((view) => (
                <li key={view.lesson.id}>
                  <p className="px-3 text-small font-semibold text-learn-muted">
                    {vi.course.lessonNumber} {view.number} · {view.lesson.title}
                  </p>
                  <ul className="mt-1">
                    <OutlineRow
                      to={`/bai-hoc/${view.lesson.id}`}
                      icon={view.lesson.hasVideo ? Clapperboard : BookOpen}
                      label={vi.learn.lessonPart}
                      done={view.status === 'da-xong'}
                      current={
                        currentExerciseId === undefined && view.lesson.id === currentLessonId
                      }
                      currentRef={currentRef}
                      onNavigate={onNavigate}
                    />
                    {view.lesson.exercises.map((exercise) => (
                      <OutlineRow
                        key={exercise.id}
                        to={`/bai-tap/${exercise.id}`}
                        icon={SquareTerminal}
                        label={exercise.title}
                        done={doneExerciseIds.has(exercise.id)}
                        current={exercise.id === currentExerciseId}
                        currentRef={currentRef}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </details>
        );
      })}
    </div>
  );
}

function OutlineRow({
  to,
  icon: Icon,
  label,
  done,
  current,
  currentRef,
  onNavigate,
}: {
  to: string;
  icon: typeof BookOpen;
  label: string;
  done: boolean;
  current: boolean;
  currentRef: RefObject<HTMLAnchorElement | null>;
  onNavigate: (() => void) | undefined;
}) {
  return (
    <li>
      <Link
        to={to}
        ref={current ? currentRef : undefined}
        aria-current={current ? 'page' : undefined}
        onClick={onNavigate}
        className={[
          'flex min-h-tap items-center gap-3 rounded-lg border-l-4 py-2 pr-3 pl-2 text-[0.9375rem] text-learn-text',
          current
            ? 'border-learn-accent bg-learn-current font-semibold'
            : 'border-transparent hover:bg-learn-hover',
        ].join(' ')}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0 text-learn-muted" />
        <span className="min-w-0 flex-1">{label}</span>
        {done ? (
          <Check aria-hidden="true" className="size-4 shrink-0 text-learn-success" />
        ) : (
          <Circle aria-hidden="true" className="size-4 shrink-0 text-learn-muted" />
        )}
        <span className="sr-only">{done ? vi.learn.done : vi.learn.notDone}</span>
      </Link>
    </li>
  );
}
