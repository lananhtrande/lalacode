import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';
import { Link, useParams } from 'react-router';
import { loadContentIndex, loadExercise, lessonIdOfExercise } from '../../content/loader';
import {
  completionOf,
  exerciseNeighbours,
  type Completion,
  type Neighbours,
} from '../../content/navigation';
import {
  awardBadges,
  getAiToken,
  exportSnapshot,
  getExerciseProgress,
  markLessonStarted,
  quietly,
  recordAttempt,
  saveDraft,
} from '../../progress/db';
import { evaluateBadges } from '../../progress/badges';
import { dayKey } from '../../progress/streak';
import type { ContentIndex, LessonBundle, PublicExercise } from '../../content/types';
import type { ProgressSnapshot } from '../../progress/schema';
import type { DrawCommand, TestResult } from '../../runner/protocol';
import { createRunner, type Runner } from '../../runner/runner-client';
import { describeRunError, type RunErrorInfo } from '../../runner/messages';
import { vi } from '../../shared/i18n/vi';
import { HintPanel } from './HintPanel';
import { TestResultList } from './TestResultList';
import { TurtleCanvas } from './TurtleCanvas';
import { ErrorPanel } from './ErrorPanel';
import { ExerciseBrief } from './ExerciseBrief';
import { EditorPane } from './EditorPane';
import { PANEL_MIN, PanelResizer, ResultsPanel, type ResultTab } from './ResultsPanel';
import { useMediaQuery } from '../../shared/lib/media';
import { useStoredState } from '../../shared/lib/stored-state';
import { ExerciseToolbar } from './ExerciseToolbar';
import { OutputConsole } from './OutputConsole';
import { buttonClasses } from '../../shared/ui/button-classes';
import { NeighbourLinks } from '../../shared/ui/NeighbourLinks';
import { toNeighbourLink } from '../../shared/ui/neighbour-link';
import { NextStepCard } from './NextStepCard';
import { TopbarSlot } from '../learn/topbar-slot';

type Phase = 'idle' | 'running' | 'grading';
/** Lưu lần nộp vào máy: chạy ngầm, nhưng e2e cần biết khi nào xong. */
type SaveState = 'idle' | 'saving' | 'saved';

export function ExercisePage() {
  const { exerciseId = '' } = useParams();
  const [exercise, setExercise] = useState<PublicExercise | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [aiToken, setAiToken] = useState<string | undefined>(undefined);
  /** Mã các bài tập của bài học này, để biết khi nào bài học coi như xong. */
  const [lessonExerciseIds, setLessonExerciseIds] = useState<readonly string[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [pythonReady, setPythonReady] = useState(false);
  const [stdout, setStdout] = useState('');
  const [error, setError] = useState<RunErrorInfo | null>(null);
  const [results, setResults] = useState<readonly TestResult[] | null>(null);
  const [drawing, setDrawing] = useState<readonly DrawCommand[]>([]);
  const runnerRef = useRef<Runner | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  /** Tăng mỗi khi chạy/nộp xong, để đưa khu kết quả vào tầm mắt. */
  const [revealTick, setRevealTick] = useState(0);
  /** Bài trước/tiếp (S0-36) và dữ liệu để biết trẻ đã xong bài học/khoá chưa. */
  const [neighbours, setNeighbours] = useState<Neighbours | null>(null);
  const [context, setContext] = useState<{ index: ContentIndex; lesson: LessonBundle } | null>(
    null,
  );
  const [completion, setCompletion] = useState<Completion | null>(null);
  /** Mã bài đang mở, để kết quả của một lần chạy dở không đổ nhầm sang bài khác. */
  const activeIdRef = useRef(exerciseId);

  // Bố cục chia đôi (S0-39): ≥ 1024px đề bài trái, editor + panel kết quả phải;
  // hẹp hơn thì ba tab Đề · Code · Kết quả.
  const wide = useMediaQuery('(min-width: 1024px)');
  const [mobilePart, setMobilePart] = useState<Part>('de');
  const [resultTab, setResultTab] = useState<ResultTab>('ket-qua');
  const [panel, setPanel] = useStoredState<PanelState>(
    'lalakode.results-panel',
    { height: 280, collapsed: false },
    isPanelState,
  );
  const briefId = useId();
  const codeId = useId();
  const resultsId = useId();
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const toolbarInView = useInView(toolbarRef, wide);

  // Đi thẳng từ bài tập này sang bài tập khác thì màn hình không được dựng lại
  // (cùng route): xoá kết quả của bài cũ ngay lúc đổi bài.
  const [shownFor, setShownFor] = useState(exerciseId);
  if (shownFor !== exerciseId) {
    setShownFor(exerciseId);
    setExercise(null);
    setStdout('');
    setError(null);
    setResults(null);
    setDrawing([]);
    setPhase('idle');
    setSaveState('idle');
    setNeighbours(null);
    setCompletion(null);
    setMobilePart('de');
    setResultTab('ket-qua');
  }

  // Rời bài đang chạy dở thì dừng nó; Pyodide giữ nguyên nếu không có gì đang chạy.
  useEffect(() => {
    activeIdRef.current = exerciseId;
    return () => runnerRef.current?.cancel();
  }, [exerciseId]);

  // Token ẩn danh cho gợi ý AI; không lấy được thì panel chỉ dùng gợi ý viết sẵn.
  useEffect(() => {
    let active = true;
    void quietly(() => getAiToken()).then((token) => {
      if (active && token !== undefined) setAiToken(token);
    });
    return () => {
      active = false;
    };
  }, []);

  // Một runner cho cả màn hình; nạp Pyodide ngầm ngay khi trẻ mở bài tập.
  useEffect(() => {
    const runner = createRunner();
    runnerRef.current = runner;
    runner
      .preload()
      .then(() => setPythonReady(true))
      .catch(() => setPythonReady(false));
    return () => {
      runner.dispose();
      runnerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadExercise(exerciseId)
      .then(async ({ exercise: found, lesson }) => {
        if (!active) return;
        // Mở lại bài thì thấy đúng code lúc rời đi; chưa làm bao giờ thì lấy code khởi đầu.
        const saved = await quietly(() => getExerciseProgress(found.id));
        if (!active) return;
        setExercise(found);
        setLessonExerciseIds(lesson.exercises.map((item) => item.id));
        setCode(saved?.draftCode ?? found.starterCode);
        setRestoredDraft(saved !== undefined);
        setLoadFailed(false);
        void quietly(() =>
          markLessonStarted(lessonIdOfExercise(found.id), found.id.split('.')[0] ?? ''),
        );
        // Không có index thì chỉ thiếu nút bài trước/tiếp, bài tập vẫn làm được.
        const index = await loadContentIndex().catch(() => null);
        if (!active || !index) return;
        setContext({ index, lesson });
        setNeighbours(exerciseNeighbours(index, lesson, found.id));
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [exerciseId]);

  // Lưu nháp sau khi trẻ ngừng gõ một nhịp, để không ghi đĩa sau mỗi phím.
  useEffect(() => {
    if (!exercise || code === '') return;
    const timer = setTimeout(() => {
      void quietly(() => saveDraft(exercise.id, lessonIdOfExercise(exercise.id), code));
    }, 800);
    return () => clearTimeout(timer);
  }, [code, exercise]);

  const clearOutcome = useCallback(() => {
    setStdout('');
    setError(null);
    setResults(null);
  }, []);

  async function run() {
    if (!exercise || !runnerRef.current) return;
    clearOutcome();
    setPhase('running');
    const outcome = await runnerRef.current.run(code, { timeoutMs: exercise.timeoutMs });
    if (activeIdRef.current !== exercise.id) return;
    setPhase('idle');
    setDrawing(outcome.drawing);
    if (outcome.ok) setStdout(outcome.result.stdout + outcome.result.stderr);
    else setError(describeRunError(outcome.error));
    // Chạy thử chỉ cần xem output: sang tab "Kết quả".
    setResultTab('ket-qua');
    setMobilePart('ket-qua');
    setRevealTick((tick) => tick + 1);
  }

  async function submit() {
    if (!exercise || !runnerRef.current) return;
    clearOutcome();
    setPhase('grading');
    const outcome = await runnerRef.current.grade(code, exercise.tests, {
      timeoutMs: exercise.timeoutMs,
    });
    if (activeIdRef.current !== exercise.id) return;
    setPhase('idle');
    // Nộp xong thì xem tab "Kiểm tra"; Python lỗi thì lỗi hiện ở tab "Kết quả".
    setResultTab(outcome.ok ? 'kiem-tra' : 'ket-qua');
    setMobilePart('ket-qua');
    if (outcome.ok) {
      setResults(outcome.report.results);
      setSaveState('saving');
      const passed = outcome.report.passed;
      // quietly() không bao giờ ném lỗi: lưu hỏng thì vẫn coi như đã xong lượt lưu.
      void quietly(() => saveOutcome(exercise.id, passed, code)).then((latest) => {
        if (activeIdRef.current !== exercise.id) return;
        setSaveState('saved');
        // Đọc lại tiến độ vừa lưu để khen đúng: xong bài học? xong cả khoá?
        if (passed && latest && context) {
          const done = new Set(
            latest.exercises
              .filter((item) => item.status === 'xong')
              .map((item) => item.exerciseId),
          );
          setCompletion(completionOf(context.index, context.lesson, done));
        }
      });
    } else {
      setError(describeRunError(outcome.error));
    }
    setRevealTick((tick) => tick + 1);
  }

  // Chạy/nộp xong: màn rộng thì cuộn cột kết quả lên đầu (phần vừa cập nhật nằm
  // trên cùng); màn hẹp thì cuộn trang tới khu kết quả. Tôn trọng giảm chuyển động.
  useEffect(() => {
    if (revealTick === 0) return;
    revealResults(resultsRef.current);
  }, [revealTick]);

  /**
   * Ghi lần nộp (kèm dấu trọn bài học, cùng một transaction), rồi trao huy hiệu.
   * Làm sau khi đã hiện kết quả cho trẻ: lưu trữ không được giữ chân màn hình.
   */
  async function saveOutcome(
    exerciseId: string,
    passed: boolean,
    submittedCode: string,
  ): Promise<ProgressSnapshot> {
    const lessonId = lessonIdOfExercise(exerciseId);
    await recordAttempt(exerciseId, lessonId, passed, submittedCode, lessonExerciseIds);

    // Xét huy hiệu trên ảnh chụp mới nhất (đã gồm cả bài học vừa xong).
    const latest = await exportSnapshot();
    const earned = evaluateBadges(latest, dayKey(new Date()))
      .filter((badge) => badge.earned)
      .map((badge) => badge.id);
    if (earned.length > 0) await awardBadges(earned);
    return latest;
  }

  if (loadFailed) {
    return (
      <section className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl font-bold">{vi.exercise.notFound}</h1>
        <Link to="/khoa-hoc" className={buttonClasses('primary', 'md', 'mt-4')}>
          {vi.exercise.backToCatalog}
        </Link>
      </section>
    );
  }

  if (!exercise) {
    return (
      <p role="status" className="text-ink-soft">
        {vi.exercise.loading}
      </p>
    );
  }

  const busy = phase !== 'idle';
  const passedAll = results !== null && results.length > 0 && results.every((item) => item.passed);
  const panelMax = Math.max(PANEL_MIN * 2, Math.round(window.innerHeight * 0.6));
  const showPart = (part: Part) => wide || mobilePart === part;

  const toolbar = (inTopbar: boolean) => (
    <ExerciseToolbar
      phase={phase}
      placement={inTopbar ? 'topbar' : 'page'}
      onRun={() => void run()}
      onSubmit={() => void submit()}
      onStop={() => runnerRef.current?.cancel()}
    />
  );

  return (
    <article
      data-save-state={saveState}
      // Màn hẹp chừa chỗ cho thanh nút dính đáy; màn rộng cao đúng phần dưới topbar
      // của khung học bài (3.5rem) trừ lề trên/dưới (2 × 1.5rem).
      className="flex flex-col gap-4 pb-28 lg:grid lg:h-[calc(100dvh-6.5rem)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6 lg:pb-0"
    >
      {/* Thanh nút ở topbar chỉ hiện khi thanh dưới editor bị cuộn khuất (màn rộng). */}
      {wide && !toolbarInView && <TopbarSlot>{toolbar(true)}</TopbarSlot>}
      <TopbarSlot>
        <p
          className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-small text-ink-soft"
          data-testid="python-status"
        >
          <span
            aria-hidden="true"
            className={['size-2 rounded-full', pythonReady ? 'bg-success' : 'bg-attention'].join(
              ' ',
            )}
          />
          {pythonReady ? vi.exercise.ready : vi.exercise.preparing}
        </p>
      </TopbarSlot>

      {!wide && (
        <PartTabs
          value={mobilePart}
          onChange={setMobilePart}
          ids={{ de: briefId, code: codeId, 'ket-qua': resultsId }}
        />
      )}

      <section
        id={briefId}
        {...(wide ? {} : { role: 'tabpanel', 'aria-labelledby': `${briefId}-tab` })}
        className={[
          showPart('de') ? '' : 'hidden',
          'rounded-card bg-surface p-5 shadow-card sm:p-6 lg:min-h-0 lg:overflow-y-auto',
        ].join(' ')}
      >
        <ExerciseBrief exercise={exercise}>
          <HintPanel
            hints={exercise.hints}
            exerciseId={exercise.id}
            getCode={() => code}
            getError={() => error?.raw}
            {...(aiToken === undefined ? {} : { aiToken })}
          />
        </ExerciseBrief>
      </section>

      <div className="flex flex-col lg:min-h-0">
        <div
          id={codeId}
          {...(wide ? {} : { role: 'tabpanel', 'aria-labelledby': `${codeId}-tab` })}
          className={[showPart('code') ? 'flex' : 'hidden', 'min-h-0 flex-1 flex-col'].join(' ')}
        >
          <EditorPane
            code={code}
            onChange={setCode}
            readOnly={busy}
            pythonReady={pythonReady}
            restoredDraft={restoredDraft}
            onReset={() => {
              setCode(exercise.starterCode);
              clearOutcome();
              setDrawing([]);
            }}
          />
        </div>

        {/* Ngoài các tab: màn hẹp thì dính đáy màn hình, tab nào cũng bấm được. */}
        <div ref={toolbarRef}>{toolbar(false)}</div>

        {wide && !panel.collapsed && (
          <PanelResizer
            height={Math.min(panel.height, panelMax)}
            max={panelMax}
            onChange={(height) => setPanel({ ...panel, height })}
          />
        )}

        <div
          id={resultsId}
          ref={resultsRef}
          data-testid="exercise-results"
          {...(wide ? {} : { role: 'tabpanel', 'aria-labelledby': `${resultsId}-tab` })}
          className={[
            showPart('ket-qua') ? 'flex' : 'hidden',
            'scroll-mt-28 flex-col lg:mt-0 lg:shrink-0',
            wide && !panel.collapsed ? 'h-(--results-h)' : '',
          ].join(' ')}
          style={{ ['--results-h' as string]: `${Math.min(panel.height, panelMax)}px` }}
        >
          <ResultsPanel
            tab={resultTab}
            onTabChange={setResultTab}
            testCount={exercise.tests.length}
            collapsed={wide && panel.collapsed}
            onCollapsedChange={(collapsed) => setPanel({ ...panel, collapsed })}
            output={
              <div aria-live="polite" className="space-y-4">
                {error && <ErrorPanel info={error} />}
                <OutputConsole output={stdout} />
                {exercise.turtle && <TurtleCanvas commands={drawing} />}
              </div>
            }
            tests={
              <div aria-live="polite" className="space-y-4">
                {passedAll && neighbours && (
                  <NextStepCard next={neighbours.next} completion={completion} />
                )}
                {results ? (
                  <TestResultList results={results} />
                ) : (
                  <p className="text-ink-soft" data-testid="tests-empty">
                    {vi.exercise.testsEmpty}
                  </p>
                )}
              </div>
            }
          />
        </div>

        {/* Bài trước/tiếp: luôn thấy, dưới tab đang mở (màn hẹp) hoặc dưới panel kết quả. */}
        {neighbours && (
          <NeighbourLinks
            label={vi.pager.label}
            previous={
              neighbours.previous && toNeighbourLink(neighbours.previous, 'previous', 'exercise')
            }
            next={toNeighbourLink(neighbours.next, 'next', 'exercise')}
            className="mt-3 lg:shrink-0"
          />
        )}
      </div>
    </article>
  );
}

type Part = 'de' | 'code' | 'ket-qua';
const parts: Part[] = ['de', 'code', 'ket-qua'];

/** Ba tab dính đầu màn hẹp (< 1024px): Đề · Code · Kết quả. */
function PartTabs({
  value,
  onChange,
  ids,
}: {
  value: Part;
  onChange: (part: Part) => void;
  ids: Record<Part, string>;
}) {
  const label = {
    de: vi.exercise.partBrief,
    code: vi.exercise.partCode,
    'ket-qua': vi.exercise.partResults,
  };
  const move = (event: React.KeyboardEvent, current: Part) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : parts.length - 1;
    const next = parts[(parts.indexOf(current) + step) % parts.length] ?? current;
    onChange(next);
    document.getElementById(`${ids[next]}-tab`)?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={vi.exercise.partsLabel}
      className="sticky top-14 z-10 -mx-4 -mt-4 flex gap-1 border-b border-line bg-surface px-2 sm:-mx-6"
    >
      {parts.map((part) => {
        const selected = part === value;
        return (
          <button
            key={part}
            id={`${ids[part]}-tab`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={ids[part]}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(event) => move(event, part)}
            onClick={() => onChange(part)}
            className={[
              'relative min-h-tap flex-1 px-3 text-label',
              'after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full',
              selected ? 'text-ink after:bg-accent' : 'font-medium text-ink-soft',
            ].join(' ')}
          >
            {label[part]}
          </button>
        );
      })}
    </div>
  );
}

interface PanelState {
  height: number;
  collapsed: boolean;
}

function isPanelState(value: unknown): value is PanelState {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PanelState).height === 'number' &&
    typeof (value as PanelState).collapsed === 'boolean'
  );
}

/** Phần tử có đang nằm trong màn hình không (chỉ theo dõi khi `enabled`). */
function useInView(ref: RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry?.isIntersecting ?? true),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled]);
  return inView;
}

function revealResults(target: HTMLElement | null) {
  if (!target) return;
  const media = (query: string) =>
    typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
  const behavior: ScrollBehavior = media('(prefers-reduced-motion: reduce)') ? 'auto' : 'smooth';
  if (media('(min-width: 1024px)')) {
    if (typeof target.scrollTo === 'function') target.scrollTo({ top: 0, behavior });
  } else if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ block: 'start', behavior });
  }
}
