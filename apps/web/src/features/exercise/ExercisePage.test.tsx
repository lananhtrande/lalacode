import { afterEach, beforeEach, describe, expect, it, vi as vitest } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
const loadContentIndex = vitest.fn();
vitest.mock('../../content/loader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../content/loader')>();
  return {
    ...actual,
    loadExercise: (id: string) => loadExercise(id) as unknown,
    loadContentIndex: () => loadContentIndex() as unknown,
  };
});

const getExerciseProgress = vitest.fn();
const recordAttempt = vitest.fn();
const saveDraft = vitest.fn();
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

function renderPage(exerciseId = exercise.id) {
  const router = createMemoryRouter([{ path: '/bai-tap/:exerciseId', Component: ExercisePage }], {
    initialEntries: [`/bai-tap/${exerciseId}`],
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  // Mặc định không có index: các test cũ không cần thanh bài trước/tiếp.
  loadContentIndex.mockRejectedValue(new Error('không có index'));
  getExerciseProgress.mockResolvedValue(undefined);
  recordAttempt.mockResolvedValue(undefined);
  saveDraft.mockResolvedValue(undefined);
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
      [exercise.id],
    );
  });

  it('gửi kèm đủ bài tập của bài học, để dấu trọn bài được ghi cùng lần nộp', async () => {
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
    expect(recordAttempt.mock.calls[0]?.[4]).toEqual([
      exercise.id,
      'py-khoi-dong.01-xin-chao.02-in-hai-dong',
    ]);
  });

  it('báo trạng thái lưu: đang lưu ngay sau khi chấm, đã lưu khi ghi xong', async () => {
    let finishSave: () => void = () => undefined;
    recordAttempt.mockReturnValue(new Promise<void>((resolve) => (finishSave = resolve)));
    const user = userEvent.setup();
    const { container } = renderPage();
    await user.click(await screen.findByRole('button', { name: strings.exercise.submit }));
    const article = container.querySelector('article');
    await waitFor(() => expect(article).toHaveAttribute('data-save-state', 'saving'));
    finishSave();
    await waitFor(() => expect(article).toHaveAttribute('data-save-state', 'saved'));
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
    // Lưu hỏng vẫn phải kết thúc lượt lưu, không treo ở "đang lưu".
    await waitFor(() =>
      expect(document.querySelector('article')).toHaveAttribute('data-save-state', 'saved'),
    );
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

describe('ExercisePage — sang bài tiếp theo (S0-36)', () => {
  const lessonId = 'py-khoi-dong.01-xin-chao';
  const second = { ...exercise, id: `${lessonId}.02-in-ten`, title: 'In tên' };
  const index = {
    version: 1,
    courses: [
      {
        id: 'py-khoi-dong',
        lessons: [
          { id: lessonId, title: 'Xin chào, Python!', exerciseCount: 2 },
          { id: 'py-khoi-dong.02-bien', title: 'Cái hộp tên là biến', exerciseCount: 3 },
        ],
      },
    ],
  };
  const lessonBundle = {
    version: 1,
    lesson: {
      id: lessonId,
      title: 'Xin chào, Python!',
      exercises: ['01-in-loi-chao', '02-in-ten'],
    },
    markdown: '',
    exercises: [exercise, second],
  };

  beforeEach(() => {
    loadContentIndex.mockResolvedValue(index);
    loadExercise.mockImplementation((id: string) =>
      Promise.resolve({ lesson: lessonBundle, exercise: id === second.id ? second : exercise }),
    );
  });

  it('luôn có thanh bài trước/tiếp; chưa nộp đúng thì "tiếp" chỉ là nút phụ', async () => {
    renderPage();
    const nav = await screen.findByRole('navigation', { name: strings.pager.label });
    const next = within(nav).getByRole('link', { name: 'Bài tập tiếp: In tên' });
    expect(next).toHaveAttribute('href', `/bai-tap/${second.id}`);
    expect(next.className).not.toContain('bg-accent');
    expect(
      within(nav).getByRole('link', { name: 'Về bài học: Xin chào, Python!' }),
    ).toHaveAttribute('href', `/bai-hoc/${lessonId}`);
    expect(screen.queryByTestId('next-step')).not.toBeInTheDocument();
  });

  it('nộp đúng thì nút chính "Bài tập tiếp theo" dẫn tới bài 2 và nhận focus', async () => {
    renderPage();
    await screen.findByRole('navigation', { name: strings.pager.label });
    await userEvent.click(screen.getByRole('button', { name: strings.exercise.submit }));
    const cta = await screen.findByRole('link', {
      name: new RegExp(strings.pager.nextExerciseCta),
    });
    expect(cta).toHaveAttribute('href', `/bai-tap/${second.id}`);
    expect(cta.className).toContain('bg-accent');
    await waitFor(() => expect(cta).toHaveFocus());
  });

  it('bấm đi tiếp thì sang bài 2 sạch sẽ: không còn kết quả của bài 1', async () => {
    renderPage();
    await screen.findByRole('navigation', { name: strings.pager.label });
    await userEvent.click(screen.getByRole('button', { name: strings.exercise.submit }));
    await userEvent.click(
      await screen.findByRole('link', { name: new RegExp(strings.pager.nextExerciseCta) }),
    );
    expect(await screen.findByRole('heading', { name: 'In tên' })).toBeInTheDocument();
    expect(screen.queryByText(strings.exercise.allPassed)).not.toBeInTheDocument();
    expect(screen.queryByTestId('next-step')).not.toBeInTheDocument();
  });

  it('nộp sai thì không có nút chính đi tiếp', async () => {
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
            detail: null,
          },
        ],
      },
    });
    renderPage();
    await screen.findByRole('navigation', { name: strings.pager.label });
    await userEvent.click(screen.getByRole('button', { name: strings.exercise.submit }));
    await screen.findByText(strings.exercise.somePassed);
    expect(screen.queryByTestId('next-step')).not.toBeInTheDocument();
  });

  it('bài tập cuối, xong cả bài học: "Hoàn thành bài học · Sang bài học tiếp" tới bài học kế', async () => {
    exportSnapshot.mockResolvedValue(snapshotWith([exercise.id, second.id]));
    renderPage(second.id);
    await screen.findByRole('navigation', { name: strings.pager.label });
    await userEvent.click(screen.getByRole('button', { name: strings.exercise.submit }));
    const card = await screen.findByTestId('next-step');
    await waitFor(() => expect(card).toHaveTextContent(strings.pager.lessonDone));
    expect(within(card).getByRole('link')).toHaveTextContent(strings.pager.finishLessonCta);
    expect(within(card).getByRole('link')).toHaveAttribute('href', '/bai-hoc/py-khoi-dong.02-bien');
  });

  it('bài tập cuối nhưng bài học còn bài chưa xong: không khen "xong bài học"', async () => {
    exportSnapshot.mockResolvedValue(snapshotWith([second.id]));
    renderPage(second.id);
    await screen.findByRole('navigation', { name: strings.pager.label });
    await userEvent.click(screen.getByRole('button', { name: strings.exercise.submit }));
    const card = await screen.findByTestId('next-step');
    await waitFor(() => expect(card).toHaveTextContent(strings.pager.lastExerciseDone));
    expect(within(card).getByRole('link')).toHaveTextContent(strings.pager.nextLessonCta);
  });
});
