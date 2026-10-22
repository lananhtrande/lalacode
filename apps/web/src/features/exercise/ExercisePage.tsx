import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Play, RotateCcw, Send, Square } from 'lucide-react';
import { loadExercise, lessonIdOfExercise } from '../../content/loader';
import {
  awardBadges,
  getAiToken,
  exportSnapshot,
  getExerciseProgress,
  markLessonCompleted,
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
import { RichText } from '../../shared/ui/RichText';
import { vi } from '../../shared/i18n/vi';
import { HintPanel } from './HintPanel';
import { TestResultList } from './TestResultList';
import { TurtleCanvas } from './TurtleCanvas';

type Phase = 'idle' | 'running' | 'grading';

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
  const [pythonReady, setPythonReady] = useState(false);
  const [stdout, setStdout] = useState('');
  const [error, setError] = useState<RunErrorInfo | null>(null);
  const [results, setResults] = useState<readonly TestResult[] | null>(null);
  const [drawing, setDrawing] = useState<readonly DrawCommand[]>([]);
  const runnerRef = useRef<Runner | null>(null);

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
      void quietly(() => saveOutcome(exercise.id, outcome.report.passed, code));
    } else {
      setError(describeRunError(outcome.error));
    }
  }

  /**
   * Ghi lần nộp, rồi xét bài học đã trọn chưa và trao huy hiệu.
   * Làm sau khi đã hiện kết quả cho trẻ: lưu trữ không được giữ chân màn hình.
   */
  async function saveOutcome(exerciseId: string, passed: boolean, submittedCode: string) {
    const lessonId = lessonIdOfExercise(exerciseId);
    const courseId = exerciseId.split('.')[0] ?? '';
    await recordAttempt(exerciseId, lessonId, passed, submittedCode);

    const snapshot = await exportSnapshot();
    const doneIds = new Set(
      snapshot.exercises.filter((item) => item.status === 'xong').map((item) => item.exerciseId),
    );
    if (lessonExerciseIds.length > 0 && lessonExerciseIds.every((id) => doneIds.has(id))) {
      await markLessonCompleted(lessonId, courseId);
    }

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
          className="mt-4 inline-flex min-h-tap items-center rounded-xl bg-brand-500 px-5 font-semibold text-white"
        >
          {vi.exercise.backToMap}
        </Link>
      </section>
    );
  }

  if (!exercise) {
    return (
      <p role="status" className="text-ink-muted">
        {vi.exercise.loading}
      </p>
    );
  }

  const busy = phase !== 'idle';

  return (
    <article className="space-y-6">
      <header>
        <Link
          to={`/bai-hoc/${lessonIdOfExercise(exercise.id)}`}
          className="text-sm font-medium text-brand-600 underline"
        >
          ← {lessonTitle}
        </Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{exercise.title}</h1>
        <p className="mt-2 whitespace-pre-line">
          <RichText text={exercise.prompt} />
        </p>
      </header>

      <section aria-labelledby="code-cua-em">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="code-cua-em" className="text-lg font-bold">
            {vi.exercise.yourCode}
          </h2>
          {restoredDraft && (
            <p className="text-sm text-ink-muted" data-testid="restored-draft">
              {vi.exercise.restored}
            </p>
          )}
          <p className="text-sm text-ink-muted" data-testid="python-status">
            {pythonReady ? vi.exercise.ready : vi.exercise.preparing}
          </p>
        </div>
        <div className="mt-2">
          <CodeEditor
            value={code}
            onChange={setCode}
            label={vi.exercise.yourCode}
            readOnly={busy}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void run()}
            disabled={busy}
            className="inline-flex min-h-tap items-center gap-2 rounded-xl border border-line px-5 font-semibold disabled:opacity-60"
          >
            <Play aria-hidden="true" className="size-4" />
            {phase === 'running' ? vi.exercise.running : vi.exercise.run}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className="inline-flex min-h-tap items-center gap-2 rounded-xl bg-brand-500 px-5 font-semibold text-white disabled:opacity-60"
          >
            <Send aria-hidden="true" className="size-4" />
            {phase === 'grading' ? vi.exercise.grading : vi.exercise.submit}
          </button>
          {busy && (
            <button
              type="button"
              onClick={() => runnerRef.current?.cancel()}
              className="inline-flex min-h-tap items-center gap-2 rounded-xl border border-line px-4 font-semibold"
            >
              <Square aria-hidden="true" className="size-4" />
              {vi.exercise.stop}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setCode(exercise.starterCode);
              clearOutcome();
              setDrawing([]);
            }}
            disabled={busy}
            className="inline-flex min-h-tap items-center gap-2 rounded-xl px-3 font-medium text-ink-muted underline disabled:opacity-60"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {vi.exercise.reset}
          </button>
        </div>
      </section>

      {error && <ErrorPanel info={error} />}

      <section aria-labelledby="ket-qua-chay">
        <h2 id="ket-qua-chay" className="text-lg font-bold">
          {vi.exercise.outputTitle}
        </h2>
        <pre
          data-testid="exercise-output"
          className="mt-2 min-h-16 overflow-x-auto rounded-xl bg-surface-muted p-3 font-mono text-sm"
        >
          {stdout || vi.exercise.outputEmpty}
        </pre>
      </section>

      {exercise.turtle && <TurtleCanvas commands={drawing} />}

      {results && <TestResultList results={results} />}

      <HintPanel
        hints={exercise.hints}
        exerciseId={exercise.id}
        getCode={() => code}
        getError={() => error?.raw}
        {...(aiToken === undefined ? {} : { aiToken })}
      />
    </article>
  );
}

function ErrorPanel({ info }: { info: RunErrorInfo }) {
  return (
    <section
      role="alert"
      data-testid="exercise-error"
      className="rounded-2xl border border-warn-500/40 bg-warn-500/5 p-4"
    >
      <h2 className="font-bold">{vi.exercise.errorTitle}</h2>
      <p className="mt-1">
        {info.title}
        {info.line !== undefined && (
          <span className="text-ink-muted">
            {' '}
            ({vi.exercise.errorLine} {info.line})
          </span>
        )}
      </p>
      {info.hint !== undefined && <p className="mt-1 text-ink-muted">{info.hint}</p>}
      {info.raw !== undefined && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-ink-muted">{vi.exercise.showRaw}</summary>
          <pre className="mt-1 overflow-x-auto font-mono text-sm">{info.raw}</pre>
        </details>
      )}
    </section>
  );
}
