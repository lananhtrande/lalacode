import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router';
import { ChevronRight, ListTree, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { lessonIdOfExercise } from '../../content/loader';
import type { CourseProgress } from '../../content/catalog';
import type { CourseSummary } from '../../content/types';
import { fill } from '../../shared/i18n/fill';
import { vi } from '../../shared/i18n/vi';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import { useCourses } from '../courses/useCourses';
import { CourseOutline } from './CourseOutline';
import { TopbarSlotContext } from './topbar-slot';

type PageKind = 'bai-hoc' | 'bai-tap';

const TOGGLE_ID = 'nut-muc-luc';

/**
 * Khung học bài cho `/bai-hoc/:id` và `/bai-tap/:id` (S0-38, ADR 0011): không
 * dùng sidebar chung của app mà dùng mục lục khoá nền tối bên trái, topbar có
 * breadcrumb. Dưới 1024px mục lục là ngăn kéo mở bằng nút "Mục lục".
 */
export function LearnLayout() {
  const params = useParams();
  const exerciseId = params['exerciseId'];
  const lessonId = params['lessonId'] ?? (exerciseId ? lessonIdOfExercise(exerciseId) : '');
  const courseId = lessonId.split('.')[0] ?? '';
  const kind: PageKind = exerciseId ? 'bai-tap' : 'bai-hoc';
  const { pathname } = useLocation();

  const state = useCourses();
  const item =
    state.status === 'ready'
      ? state.courses.find((entry) => entry.course.id === courseId)
      : undefined;
  const snapshot = state.progress.snapshot;
  const doneExerciseIds = useMemo(
    () =>
      new Set(
        (snapshot?.exercises ?? [])
          .filter((exercise) => exercise.status === 'xong')
          .map((exercise) => exercise.exerciseId),
      ),
    [snapshot],
  );

  const [collapsed, setCollapsed] = useCollapsed(kind);
  // Như menu của khung chung: nhớ ngăn kéo được mở ở trang nào, sang trang khác là tự đóng.
  const [drawerAt, setDrawerAt] = useState<string | null>(null);
  const drawerOpen = drawerAt === pathname;
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  const closeDrawer = () => {
    setDrawerAt(null);
    // Trả focus về nút "Mục lục" như mọi hộp thoại (WAI-ARIA dialog).
    document.getElementById(TOGGLE_ID)?.focus();
  };

  const lesson = item?.progress.lessons.find((view) => view.lesson.id === lessonId);
  const exerciseNumber =
    exerciseId && lesson
      ? lesson.lesson.exercises.findIndex((exercise) => exercise.id === exerciseId) + 1
      : 0;

  const sidebar = (mode: 'full' | 'strip', onNavigate?: () => void) =>
    item ? (
      <SidebarContent
        course={item.course}
        progress={item.progress}
        mode={mode}
        lessonId={lessonId}
        exerciseId={exerciseId}
        doneExerciseIds={doneExerciseIds}
        onNavigate={onNavigate}
        toggle={
          onNavigate ? (
            <DarkIconButton label={vi.learn.closeOutline} onClick={closeDrawer} autoFocus>
              <X aria-hidden="true" className="size-5" />
            </DarkIconButton>
          ) : (
            <DarkIconButton
              label={collapsed ? vi.learn.expand : vi.learn.collapse}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" className="size-5" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="size-5" />
              )}
            </DarkIconButton>
          )
        }
      />
    ) : null;

  return (
    <div className="min-h-dvh text-ink lg:flex">
      <a
        href="#noi-dung"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
      >
        {vi.nav.skipToContent}
      </a>

      <aside
        data-testid="learn-sidebar"
        data-collapsed={collapsed}
        className={[
          'learn-dark sticky top-0 hidden h-dvh shrink-0 flex-col bg-learn-bg text-learn-text lg:flex',
          collapsed ? 'w-16' : 'w-70',
        ].join(' ')}
      >
        {sidebar(collapsed ? 'strip' : 'full')}
      </aside>

      {drawerOpen && <Drawer onClose={closeDrawer}>{sidebar('full', closeDrawer)}</Drawer>}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface px-3 sm:px-4">
          <button
            id={TOGGLE_ID}
            type="button"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerAt(pathname)}
            className="flex min-h-tap shrink-0 items-center gap-2 rounded-lg px-3 text-label hover:bg-surface-muted lg:hidden"
          >
            <ListTree aria-hidden="true" className="size-5" />
            {vi.learn.openOutline}
          </button>
          {item && lesson && (
            <>
              <Breadcrumb
                course={item.course}
                lessonId={lessonId}
                lessonLabel={fill(vi.learn.lessonCrumb, {
                  n: lesson.number,
                  title: lesson.lesson.title,
                })}
                onExercise={kind === 'bai-tap'}
              />
              <p className="hidden shrink-0 gap-2 text-small text-ink-soft sm:flex">
                <span
                  className="rounded-full bg-surface-muted px-2.5 py-0.5"
                  data-testid="lesson-counter"
                >
                  {fill(vi.learn.lessonCounter, {
                    n: lesson.number,
                    total: item.progress.totalLessons,
                  })}
                </span>
                {exerciseNumber > 0 && (
                  <span
                    className="rounded-full bg-surface-muted px-2.5 py-0.5"
                    data-testid="exercise-counter"
                  >
                    {fill(vi.learn.exerciseCounter, {
                      n: exerciseNumber,
                      total: lesson.lesson.exerciseCount,
                    })}
                  </span>
                )}
              </p>
            </>
          )}
          <div ref={setSlot} className="ml-auto flex shrink-0 items-center gap-2" />
        </header>

        <main id="noi-dung" className="w-full flex-1 px-4 py-4 sm:px-6 lg:py-6">
          <TopbarSlotContext.Provider value={slot}>
            <Outlet />
          </TopbarSlotContext.Provider>
        </main>
      </div>
    </div>
  );
}

const STORAGE_KEY = 'lalakode.learn-sidebar';

/**
 * Sidebar thu gọn hay mở, nhớ riêng cho màn bài học và màn bài tập. Màn bài tập
 * mặc định thu gọn để editor rộng. `localStorage` bị chặn (Safari riêng tư…)
 * thì vẫn bấm được, chỉ là không nhớ.
 */
function useCollapsed(kind: PageKind): [boolean, (value: boolean) => void] {
  const read = () => {
    try {
      const saved = window.localStorage.getItem(`${STORAGE_KEY}.${kind}`);
      if (saved === 'thu-gon') return true;
      if (saved === 'mo-rong') return false;
    } catch {
      /* không đọc được thì dùng mặc định */
    }
    return kind === 'bai-tap';
  };
  const [state, setState] = useState(() => ({ kind, collapsed: read() }));
  // Đi từ bài học sang bài tập (cùng khung) thì đọc lại lựa chọn của màn mới.
  const current = state.kind === kind ? state : { kind, collapsed: read() };
  if (current !== state) setState(current);

  const set = (value: boolean) => {
    setState({ kind, collapsed: value });
    try {
      window.localStorage.setItem(`${STORAGE_KEY}.${kind}`, value ? 'thu-gon' : 'mo-rong');
    } catch {
      /* không lưu được: lựa chọn chỉ giữ tới khi tải lại trang */
    }
  };
  return [current.collapsed, set];
}

function SidebarContent({
  course,
  progress,
  mode,
  lessonId,
  exerciseId,
  doneExerciseIds,
  onNavigate,
  toggle,
}: {
  course: CourseSummary;
  progress: CourseProgress;
  mode: 'full' | 'strip';
  lessonId: string;
  exerciseId: string | undefined;
  doneExerciseIds: ReadonlySet<string>;
  onNavigate: (() => void) | undefined;
  toggle: ReactNode;
}) {
  const caption = fill(vi.learn.progress, {
    done: progress.doneLessons,
    total: progress.totalLessons,
    percent: progress.percent,
  });

  if (mode === 'strip') {
    return (
      <div className="flex flex-col items-center gap-3 py-3">
        {toggle}
        <Link
          to={`/khoa-hoc/${course.id}`}
          aria-label={`${vi.learn.toCourse}: ${course.title}`}
          className="flex size-10 items-center justify-center rounded-lg hover:bg-learn-hover"
        >
          <img src="/brand/lalakode-mark-small.svg" alt="" width={28} height={28} />
        </Link>
        <p className="text-small font-semibold text-learn-text tabular-nums" aria-label={caption}>
          {progress.percent}%
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-learn-line px-3 pt-3 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/khoa-hoc/${course.id}`}
            aria-label={`${vi.learn.toCourse}: ${course.title}`}
            onClick={onNavigate}
            className="flex min-h-tap items-center rounded-lg px-1"
          >
            <img src="/brand/lalakode-logo-dark.svg" alt="" width={113} height={26} />
          </Link>
          {toggle}
        </div>
        <p className="mt-3 px-1 text-label text-learn-text">{course.title}</p>
        <div className="mt-2 px-1">
          <ProgressBar
            percent={progress.percent}
            label={vi.catalog.progressLabel}
            caption={caption}
            tone="dark"
          />
        </div>
      </div>
      <nav aria-label={vi.learn.outline} className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <CourseOutline
          progress={progress}
          currentLessonId={lessonId}
          currentExerciseId={exerciseId}
          doneExerciseIds={doneExerciseIds}
          onNavigate={onNavigate}
        />
      </nav>
    </>
  );
}

function DarkIconButton({
  label,
  children,
  ...rest
}: {
  label: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-learn-text hover:bg-learn-hover"
      {...rest}
    >
      {children}
    </button>
  );
}

/** Ngăn kéo mục lục dưới 1024px. Esc hoặc bấm ra ngoài thì đóng, focus về nút "Mục lục". */
function Drawer({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={vi.learn.outline}
        data-testid="outline-drawer"
        className="learn-dark absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-learn-bg text-learn-text shadow-card"
      >
        {children}
      </div>
    </div>
  );
}

function Breadcrumb({
  course,
  lessonId,
  lessonLabel,
  onExercise,
}: {
  course: CourseSummary;
  lessonId: string;
  lessonLabel: string;
  onExercise: boolean;
}) {
  const separator = <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-soft" />;
  return (
    <nav aria-label={vi.learn.breadcrumb} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-small">
        <li className="hidden items-center gap-1 md:flex">
          <Link to="/khoa-hoc" className="text-accent-strong underline">
            {vi.learn.courses}
          </Link>
          {separator}
        </li>
        <li className="hidden min-w-0 items-center gap-1 md:flex">
          <Link to={`/khoa-hoc/${course.id}`} className="truncate text-accent-strong underline">
            {course.title}
          </Link>
          {separator}
        </li>
        <li className="min-w-0">
          {onExercise ? (
            <Link
              to={`/bai-hoc/${lessonId}`}
              className="block truncate font-semibold text-accent-strong underline"
            >
              {lessonLabel}
            </Link>
          ) : (
            <span aria-current="page" className="block truncate font-semibold">
              {lessonLabel}
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
}
