import { Link, useParams } from 'react-router';
import { ArrowRight, Check, ChevronDown, CircleDashed, Clock, Dumbbell, PlayCircle } from 'lucide-react';
import {
  currentChapterId,
  type ChapterProgressView,
  type LessonProgressView,
} from '../../content/catalog';
import { fill } from '../../shared/i18n/fill';
import { vi } from '../../shared/i18n/vi';
import { ButtonLink } from '../../shared/ui/ButtonLink';
import { LevelBadge } from '../../shared/ui/LevelBadge';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import { courseMeta } from './CourseCard';
import { StreakBanner } from './StreakBanner';
import { useCourses, type CourseWithProgress } from './useCourses';

/** Trang một khoá `/khoa-hoc/:courseId` (S0-37): tiến độ và mục lục theo chương. */
export function CoursePage() {
  const { courseId = '' } = useParams();
  const state = useCourses();

  if (state.status === 'loading') {
    return (
      <p className="text-ink-soft" role="status">
        {vi.catalog.loading}
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <p className="text-attention" role="alert">
        {vi.catalog.error}
      </p>
    );
  }

  const item = state.courses.find((entry) => entry.course.id === courseId);
  if (!item) {
    return (
      <section>
        <h1 className="text-page-title">{vi.course.notFound}</h1>
        <Link
          to="/khoa-hoc"
          className="mt-4 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {vi.course.backToCatalog}
        </Link>
      </section>
    );
  }

  const earnedBadges = state.progress.badges.filter((badge) => badge.earned).length;
  const openChapter = currentChapterId(item.progress);

  return (
    <article>
      <Link
        to="/khoa-hoc"
        className="inline-flex min-h-tap items-center font-medium text-accent-strong underline"
      >
        {vi.course.backToCatalog}
      </Link>

      <CourseHeader item={item} />

      <div className="mt-6">
        <StreakBanner days={state.progress.streakDays} />
      </div>
      {earnedBadges > 0 && (
        <Link
          to="/huy-hieu"
          className="mt-3 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {earnedBadges} {vi.badges.countEarned} · {vi.badges.seeAll}
        </Link>
      )}

      <h2 className="mt-8 text-section-title">{vi.course.chaptersTitle}</h2>
      <div className="mt-4 space-y-3">
        {item.progress.chapters.map((chapter) => (
          <ChapterSection
            key={chapter.chapter.id}
            chapter={chapter}
            defaultOpen={chapter.chapter.id === openChapter}
          />
        ))}
      </div>
    </article>
  );
}

function CourseHeader({ item }: { item: CourseWithProgress }) {
  const { course, progress } = item;
  const next = progress.nextLesson;
  const action =
    progress.status === 'chua-hoc' && next
      ? { label: vi.course.start, to: `/bai-hoc/${next.lesson.id}`, variant: 'primary' as const }
      : progress.status === 'dang-hoc' && next
        ? {
            label: fill(vi.catalog.continueLesson, { n: next.number }),
            to: `/bai-hoc/${next.lesson.id}`,
            variant: 'primary' as const,
          }
        : {
            label: vi.catalog.review,
            to: `/bai-hoc/${course.lessons[0]?.id ?? ''}`,
            variant: 'outline' as const,
          };

  return (
    <header className="mt-2 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <LevelBadge level={course.level} />
        <h1 className="mt-3 text-page-title">{course.title}</h1>
        <p className="mt-2 text-card-title font-normal text-ink-soft">{course.summary}</p>
        <p className="mt-3 text-small text-ink-soft">{courseMeta(item)}</p>
        <p className="mt-4 font-semibold" data-testid="course-done">
          {progress.doneLessons}/{progress.totalLessons} {vi.course.lessonsDone}
        </p>
        <div className="mt-2 max-w-md">
          <ProgressBar percent={progress.percent} label={vi.catalog.progressLabel} />
        </div>
        <ButtonLink to={action.to} variant={action.variant} size="lg" className="mt-5">
          {action.label}
          <ArrowRight aria-hidden="true" className="size-5" />
        </ButtonLink>
      </div>
      <img
        src={`/illustrations/${course.illustration}`}
        alt=""
        width={320}
        height={180}
        className="hidden w-full rounded-card md:block"
      />
    </header>
  );
}

function ChapterSection({
  chapter,
  defaultOpen,
}: {
  chapter: ChapterProgressView;
  defaultOpen: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      data-testid={`chapter-${chapter.chapter.id}`}
      className="group rounded-card border border-line"
    >
      <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 py-3 hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
        <span className="text-card-title">
          {vi.course.chapter} {chapter.number} · {chapter.chapter.title}
        </span>
        <span className="flex shrink-0 items-center gap-2 text-small font-semibold text-ink-soft">
          {chapter.doneLessons}/{chapter.lessons.length} {vi.catalog.lessons}
          <ChevronDown
            aria-hidden="true"
            className="size-5 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </span>
      </summary>
      <ol className="border-t border-line">
        {chapter.lessons.map((view) => (
          <li key={view.lesson.id} className="border-b border-line last:border-b-0">
            <LessonRow view={view} />
          </li>
        ))}
      </ol>
    </details>
  );
}

const statusView = {
  'da-xong': { icon: Check, text: vi.course.done, className: 'text-success' },
  'dang-hoc': { icon: PlayCircle, text: vi.course.doing, className: 'text-accent-strong' },
  'chua-hoc': { icon: CircleDashed, text: vi.course.notStarted, className: 'text-ink-soft' },
} as const;

function LessonRow({ view }: { view: LessonProgressView }) {
  const { lesson, number, doneExercises, status } = view;
  const { icon: Icon, text, className } = statusView[status];
  return (
    <Link
      to={`/bai-hoc/${lesson.id}`}
      data-testid={`lesson-${lesson.id}`}
      className="flex min-h-tap flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface-muted"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={[
            'flex size-8 shrink-0 items-center justify-center rounded-full font-bold',
            status === 'da-xong'
              ? 'bg-success-surface text-success'
              : 'bg-accent-soft text-accent-strong',
          ].join(' ')}
        >
          <span className="sr-only">{vi.course.lessonNumber} </span>
          {number}
        </span>
        <span className="font-semibold">{lesson.title}</span>
        {import.meta.env.DEV && lesson.status === 'draft' && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-small font-semibold text-ink-soft">
            {vi.course.draftBadge}
          </span>
        )}
      </span>
      <span className="flex flex-wrap items-center gap-x-4 text-small text-ink-soft">
        <span className={['flex items-center gap-1 font-semibold', className].join(' ')}>
          <Icon aria-hidden="true" className="size-4" />
          {text}
        </span>
        <span className="flex items-center gap-1">
          <Clock aria-hidden="true" className="size-4" />
          {lesson.estimatedMinutes} {vi.course.minutes}
        </span>
        <span className="flex items-center gap-1" data-testid={`progress-${lesson.id}`}>
          <Dumbbell aria-hidden="true" className="size-4" />
          {doneExercises}/{lesson.exerciseCount} {vi.course.exercises}
        </span>
      </span>
    </Link>
  );
}
