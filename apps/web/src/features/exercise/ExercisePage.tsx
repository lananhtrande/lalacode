import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { loadExercise, lessonIdOfExercise } from '../../content/loader';
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
import type { PublicExercise } from '../../content/types';
import type { DrawCommand, TestResult } from '../../runner/protocol';
import { createRunner, type Runner } from '../../runner/runner-client';
import { describeRunError, type RunErrorInfo } from '../../runner/messages';
import { CodeEditor } from '../../shared/ui/CodeEditor';
import { vi } from '../../shared/i18n/vi';
import { HintPanel } from './HintPanel';
import { TestResultList } from './TestResultList';
import { TurtleCanvas } from './TurtleCanvas';
import { ErrorPanel } from './ErrorPanel';
import { ExercisePrompt } from './ExercisePrompt';
import { ExerciseToolbar } from './ExerciseToolbar';
import { OutputConsole } from './OutputConsole';
import { buttonClasses } from '../../shared/ui/button-classes';

type Phase = 'idle' | 'running' | 'grading';
/** Lưu lần nộp vào máy: chạy ngầm, nhưng e2e cần biết khi nào xong. */
type SaveState = 'idle' | 'saving' | 'saved';

export function ExercisePage() {
  const { exerciseId = '' } = useParams();
  const [exercise, setExercise] = useState<PublicExercise | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
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
        setLessonTitle(lesson.lesson.title);
        setLessonExerciseIds(lesson.exercises.map((item) => item.id));
        setCode(saved?.draftCode ?? found.starterCode);
        setRestoredDraft(saved !== undefined);
        setLoadFailed(false);
        void quietly(() =>
          markLessonStarted(lessonIdOfExercise(found.id), found.id.split('.')[0] ?? ''),
        );
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
    setPhase('idle');
    setDrawing(outcome.drawing);
    if (outcome.ok) setStdout(outcome.result.stdout + outcome.result.stderr);
    else setError(describeRunError(outcome.error));
    setRevealTick((tick) => tick + 1);
  }

  async function submit() {
    if (!exercise || !runnerRef.current) return;
    clearOutcome();
    setPhase('grading');
    const outcome = await runnerRef.current.grade(code, exercise.tests, {
      timeoutMs: exercise.timeoutMs,
    });
    setPhase('idle');
    if (outcome.ok) {
      setResults(outcome.report.results);
      setSaveState('saving');
      // quietly() không bao giờ ném lỗi: lưu hỏng thì vẫn coi như đã xong lượt lưu.
      void quietly(() => saveOutcome(exercise.id, outcome.report.passed, code)).then(() =>
        setSaveState('saved'),
      );
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
  async function saveOutcome(exerciseId: string, passed: boolean, submittedCode: string) {
    const lessonId = lessonIdOfExercise(exerciseId);
    await recordAttempt(exerciseId, lessonId, passed, submittedCode, lessonExerciseIds);

    // Xét huy hiệu trên ảnh chụp mới nhất (đã gồm cả bài học vừa xong).
    const latest = await exportSnapshot();
    const earned = evaluateBadges(latest, dayKey(new Date()))
      .filter((badge) => badge.earned)
      .map((badge) => badge.id);
    if (earned.length > 0) await awardBadges(earned);
  }

  if (loadFailed) {
    return (
      <section className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl font-bold">{vi.exercise.notFound}</h1>
        <Link
          to="/ban-do"
          className={buttonClasses('primary', 'md', 'mt-4')}
        >
          {vi.exercise.backToMap}
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

  return (
    <article
      data-save-state={saveState}
      // Màn hẹp chừa chỗ cho thanh nút dính đáy; màn rộng cao đúng một màn hình.
      className="flex flex-col gap-4 pb-28 lg:h-[calc(100dvh-3rem)] lg:pb-0"
    >
      <header className="rounded-card bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <Link
              to={`/bai-hoc/${lessonIdOfExercise(exercise.id)}`}
              className="text-small font-medium text-accent-strong underline"
            >
              ← {lessonTitle}
            </Link>
            <h1 className="mt-1 text-section-title sm:text-page-title">
              {exercise.title}
            </h1>
          </div>
          <p
            className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-small text-ink-soft"
            data-testid="python-status"
          >
            <span
              aria-hidden="true"
              className={['size-2 rounded-full', pythonReady ? 'bg-success' : 'bg-attention'].join(' ')}
            />
            {pythonReady ? vi.exercise.ready : vi.exercise.preparing}
          </p>
        </div>
        <ExercisePrompt text={exercise.prompt} />
      </header>

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-6">
        <section aria-labelledby="code-cua-em" className="flex flex-col lg:min-h-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card bg-code-bg shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-code-gutter px-4 py-2 text-code-text">
              <h2 id="code-cua-em" className="text-label">
                {vi.exercise.yourCode}
              </h2>
              {restoredDraft && (
                <p className="text-small text-code-muted" data-testid="restored-draft">
                  {vi.exercise.restored}
                </p>
              )}
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              label={vi.exercise.yourCode}
              readOnly={busy}
              // Tối thiểu ~16 dòng ở màn rộng, ~10 dòng ở điện thoại.
              className="min-h-64 lg:min-h-[26rem] lg:flex-1"
            />
          </div>
          <ExerciseToolbar
            phase={phase}
            onRun={() => void run()}
            onSubmit={() => void submit()}
            onStop={() => runnerRef.current?.cancel()}
            onReset={() => {
              setCode(exercise.starterCode);
              clearOutcome();
              setDrawing([]);
            }}
          />
        </section>

        <div
          ref={resultsRef}
          data-testid="exercise-results"
          className="scroll-mt-20 space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1"
        >
          {/* Thứ tự ưu tiên: lỗi → output → hình rùa → kết quả chấm. */}
          <div aria-live="polite" className="space-y-4">
            {error && <ErrorPanel info={error} />}
            <OutputConsole output={stdout} />
            {exercise.turtle && <TurtleCanvas commands={drawing} />}
            {results && <TestResultList results={results} />}
          </div>
          <HintPanel
            hints={exercise.hints}
            exerciseId={exercise.id}
            getCode={() => code}
            getError={() => error?.raw}
            {...(aiToken === undefined ? {} : { aiToken })}
          />
        </div>
      </div>
    </article>
  );
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
