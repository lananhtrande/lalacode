import { afterEach, beforeEach, describe, expect, it, vi as vitest } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { ExercisePage } from './ExercisePage';
import { vi as strings } from '../../shared/i18n/vi';
import type { PublicExercise } from '../../content/types';
import type { GradeOutcome, RunOutcome } from '../../runner/runner-client';

/**
 * CodeMirror cần nhiều API bố cục mà jsdom không có, nên ở đây thay bằng
 * textarea; bản thân editor được kiểm bằng e2e trên trình duyệt thật.
 */
vitest.mock('../../shared/ui/CodeEditor', () => ({
  CodeEditor: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (value: string) => void;
    label: string;
  }) => <textarea aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />,
}));

const exercise: PublicExercise = {
  id: 'py-khoi-dong.01-xin-chao.01-in-loi-chao',
  title: 'In lời chào',
  kind: 'code',
  prompt: 'In ra dòng chữ Xin chào, Python!',
  starterCode: '# Viết code của em ở đây\n',
  tests: [{ type: 'stdout_equals', expected: 'Xin chào, Python!\n', message: 'Thử lại nhé em.' }],
  hints: ['Dùng `print`.', 'Chữ trong ngoặc kép.', 'Ví dụ: `print("Chào bạn")`.'],
  timeoutMs: 5000,
  turtle: false,
};

const loadExercise = vitest.fn();
vitest.mock('../../content/loader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../content/loader')>();
  return { ...actual, loadExercise: (id: string) => loadExercise(id) as unknown };
});

const getExerciseProgress = vitest.fn();
const recordAttempt = vitest.fn();
const saveDraft = vitest.fn();
const markLessonCompleted = vitest.fn();
const awardBadges = vitest.fn();
const exportSnapshot = vitest.fn();
vitest.mock('../../progress/db', () => ({
  quietly: async (work: () => Promise<unknown>) => {
    try {
      return await work();
    } catch {
      return undefined;
    }
  },
  getExerciseProgress: (id: string) => getExerciseProgress(id) as unknown,
  recordAttempt: (...args: unknown[]) => recordAttempt(...args) as unknown,
  saveDraft: (...args: unknown[]) => saveDraft(...args) as unknown,
  markLessonStarted: () => Promise.resolve(),
  markLessonCompleted: (...args: unknown[]) => markLessonCompleted(...args) as unknown,
  awardBadges: (...args: unknown[]) => awardBadges(...args) as unknown,
  exportSnapshot: () => exportSnapshot() as unknown,
}));

/** Ảnh chụp tiến độ giả, dùng cho phần xét bài học xong và huy hiệu. */
const snapshotWith = (doneIds: string[]) => ({
  schemaVersion: 1,
  profile: { id: 'me', createdAt: 'x', streakDays: 1, lastActiveDay: 'x', badges: [] },
  lessons: [],
  exercises: doneIds.map((id) => ({
    exerciseId: id,
    lessonId: 'py-khoi-dong.01-xin-chao',
    status: 'xong',
    attempts: 1,
    draftCode: '',
    updatedAt: 'x',
  })),
});

const run = vitest.fn<() => Promise<RunOutcome>>();
const grade = vitest.fn<() => Promise<GradeOutcome>>();
const cancel = vitest.fn();
vitest.mock('../../runner/runner-client', () => ({
  createRunner: () => ({
    preload: () => Promise.resolve({ protocolVersion: 4, pythonVersion: '3.14.0', loadMs: 5 }),
    run: () => run(),
    grade: () => grade(),
    cancel,
    dispose: vitest.fn(),
  }),
}));

function renderPage() {
  const router = createMemoryRouter([{ path: '/bai-tap/:exerciseId', Component: ExercisePage }], {
    initialEntries: [`/bai-tap/${exercise.id}`],
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  getExerciseProgress.mockResolvedValue(undefined);
  recordAttempt.mockResolvedValue(undefined);
  saveDraft.mockResolvedValue(undefined);
  markLessonCompleted.mockResolvedValue(undefined);
  awardBadges.mockResolvedValue(undefined);
  exportSnapshot.mockResolvedValue(snapshotWith([exercise.id]));
  loadExercise.mockResolvedValue({
    lesson: {
      version: 1,
      lesson: { title: 'Xin chào, Python!' },
      markdown: '',
      exercises: [{ id: exercise.id }],
    },
    exercise,
  });
  run.mockResolvedValue({
    ok: true,
    result: { stdout: 'Xin chào, Python!\n', stderr: '', durationMs: 4 },
    drawing: [],
  });
  grade.mockResolvedValue({
    ok: true,
    report: {
      passed: true,
      durationMs: 9,
      results: [
        { index: 0, type: 'stdout_equals', passed: true, message: 'Thử lại nhé em.', detail: null },
      ],
    },
  });
});

afterEach(() => vitest.clearAllMocks());

describe('ExercisePage', () => {
  it('hiện đề bài và code khởi đầu của bài tập', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: exercise.title })).toBeInTheDocument();
    expect(screen.getByText(exercise.prompt)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: strings.exercise.yourCode })).toHaveValue(
      exercise.starterCode,
    );
  });

  it('báo cho trẻ biết Python đã sẵn sàng chưa', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('python-status')).toHaveTextContent(strings.exercise.ready),
    );
  });

  it('bấm Chạy thử thì hiện output của chương trình', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.run }));
    await waitFor(() =>
      expect(screen.getByTestId('exercise-output')).toHaveTextContent('Xin chào, Python!'),
    );
  });

  it('bấm Nộp bài thì hiện kết quả từng test', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.submit }));
    expect(await screen.findByText(strings.exercise.allPassed)).toBeInTheDocument();
    expect(screen.getByText(/Test 1:/)).toHaveTextContent(strings.exercise.testPassed);
  });

  it('test chưa đạt thì hiện câu tiếng Việt của người viết bài', async () => {
    grade.mockResolvedValue({
      ok: true,
      report: {
        passed: false,
        durationMs: 9,
        results: [
          {
            index: 0,
            type: 'stdout_equals',
            passed: false,
            message: 'Thử lại nhé em.',
            detail: "cần 'Xin chào, Python!', nhận 'Chào'",
          },
        ],
      },
    });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.submit }));
    expect(await screen.findByText('Thử lại nhé em.')).toBeInTheDocument();
    expect(screen.getByText(strings.exercise.somePassed)).toBeInTheDocument();
  });

  it('lỗi Python hiện bằng tiếng Việt kèm số dòng, giữ lỗi gốc trong phần chi tiết', async () => {
    run.mockResolvedValue({
      ok: false,
      error: {
        kind: 'python',
        message: 'File "<exec>", line 2, in <module>\nZeroDivisionError: division by zero',
      },
      drawing: [],
    });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.run }));
    const panel = await screen.findByTestId('exercise-error');
    expect(panel).toHaveTextContent('Không chia được cho 0');
    expect(panel).toHaveTextContent(`${strings.exercise.errorLine} 2`);
    expect(panel).toHaveTextContent('ZeroDivisionError: division by zero');
  });

  it('hết giờ thì nói về vòng lặp, không mắng trẻ', async () => {
    run.mockResolvedValue({
      ok: false,
      error: { kind: 'timeout', message: 'Code chạy quá 5 giây' },
      drawing: [],
    });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.run }));
    expect(await screen.findByTestId('exercise-error')).toHaveTextContent(strings.runner.timeout);
  });

  it('gợi ý mở dần từng mức, không hiện hết một lúc', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByTestId('hint-ask'));
    const hints = screen.getByTestId('hint-list');
    expect(hints).toHaveTextContent('Dùng print.');
    expect(hints).not.toHaveTextContent('Chữ trong ngoặc kép.');

    await user.click(screen.getByTestId('hint-ask'));
    expect(hints).toHaveTextContent('Chữ trong ngoặc kép.');
  });

  it('Làm lại từ đầu trả code về như lúc mới mở bài', async () => {
    const user = userEvent.setup();
    renderPage();
    const editor = await screen.findByRole('textbox', { name: strings.exercise.yourCode });
    await user.clear(editor);
    await user.type(editor, 'print(1)');
    expect(editor).toHaveValue('print(1)');

    await user.click(screen.getByRole('button', { name: strings.exercise.reset }));
    expect(editor).toHaveValue(exercise.starterCode);
  });

  it('có đường quay lại bài học, ghi tên bài học chứ không phải mã file', async () => {
    renderPage();
    const back = await screen.findByRole('link', { name: /Xin chào, Python!/ });
    expect(back).toHaveAttribute('href', '/bai-hoc/py-khoi-dong.01-xin-chao');
  });

  it('hiện `code` trong đề bài và gợi ý thành chữ code, không phải dấu nháy ngược', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByTestId('hint-ask'));
    const hints = screen.getByTestId('hint-list');
    expect(hints.querySelector('code')).toHaveTextContent('print');
    expect(hints.textContent).not.toContain('`');
  });

  it('mở lại bài thì thấy đúng code đang làm dở, không bị về code khởi đầu', async () => {
    getExerciseProgress.mockResolvedValue({
      exerciseId: exercise.id,
      lessonId: 'py-khoi-dong.01-xin-chao',
      status: 'dang-lam',
      attempts: 2,
      draftCode: 'print("em làm dở")',
      updatedAt: new Date().toISOString(),
    });
    renderPage();
    const editor = await screen.findByRole('textbox', { name: strings.exercise.yourCode });
    expect(editor).toHaveValue('print("em làm dở")');
    expect(screen.getByTestId('restored-draft')).toHaveTextContent(strings.exercise.restored);
  });

  it('nộp bài thì ghi nhận kết quả vào tiến độ trên máy', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.submit }));
    await waitFor(() => expect(recordAttempt).toHaveBeenCalledTimes(1));
    expect(recordAttempt).toHaveBeenCalledWith(
      exercise.id,
      'py-khoi-dong.01-xin-chao',
      true,
      exercise.starterCode,
    );
  });

  it('làm xong hết bài tập của bài học thì đánh dấu bài học đã trọn', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.submit }));
    await waitFor(() => expect(markLessonCompleted).toHaveBeenCalledTimes(1));
    expect(markLessonCompleted).toHaveBeenCalledWith('py-khoi-dong.01-xin-chao', 'py-khoi-dong');
  });

  it('còn bài tập khác chưa xong thì chưa đánh dấu bài học trọn', async () => {
    loadExercise.mockResolvedValue({
      lesson: {
        version: 1,
        lesson: { title: 'Xin chào, Python!' },
        markdown: '',
        // Bài học có hai bài tập, trẻ mới xong một.
        exercises: [{ id: exercise.id }, { id: 'py-khoi-dong.01-xin-chao.02-in-hai-dong' }],
      },
      exercise,
    });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.submit }));
    await waitFor(() => expect(recordAttempt).toHaveBeenCalled());
    expect(markLessonCompleted).not.toHaveBeenCalled();
  });

  it('nhận huy hiệu "Bài đầu tiên" ngay sau khi làm đạt bài đầu', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.submit }));
    await waitFor(() => expect(awardBadges).toHaveBeenCalledTimes(1));
    expect(awardBadges.mock.calls[0]?.[0]).toContain('bai-dau-tien');
  });

  it('chỉ chạy thử thì không tính là một lần nộp bài', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.run }));
    await waitFor(() =>
      expect(screen.getByTestId('exercise-output')).toHaveTextContent('Xin chào, Python!'),
    );
    expect(recordAttempt).not.toHaveBeenCalled();
  });

  it('không lưu được tiến độ thì bài tập vẫn dùng bình thường', async () => {
    getExerciseProgress.mockRejectedValue(new Error('IndexedDB bị chặn'));
    recordAttempt.mockRejectedValue(new Error('IndexedDB bị chặn'));
    const user = userEvent.setup();
    renderPage();
    const editor = await screen.findByRole('textbox', { name: strings.exercise.yourCode });
    expect(editor).toHaveValue(exercise.starterCode);
    await user.click(screen.getByRole('button', { name: strings.exercise.submit }));
    expect(await screen.findByText(strings.exercise.allPassed)).toBeInTheDocument();
  });

  it('bài tập không có thì mời trẻ về bản đồ', async () => {
    loadExercise.mockRejectedValue(new Error('không có'));
    renderPage();
    expect(await screen.findByText(strings.exercise.notFound)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: strings.exercise.backToMap })).toHaveAttribute(
      'href',
      '/ban-do',
    );
  });

  it('chỉ hiện canvas khi bài tập có vẽ hình', async () => {
    renderPage();
    await screen.findByRole('heading', { name: exercise.title });
    expect(screen.queryByTestId('turtle-canvas')).not.toBeInTheDocument();
  });
});
