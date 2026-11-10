import { afterEach, beforeEach, describe, expect, it, vi as vitest } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { PracticePage } from './PracticePage';
import { vi as strings } from '../../shared/i18n/vi';
import type { ContentIndex, LessonSummary } from '../../content/types';
import type { ProgressSnapshot } from '../../progress/schema';

const loadContentIndex = vitest.fn();
const snapshot = vitest.fn<() => ProgressSnapshot | null>();
const toggleSaved = vitest.fn();

vitest.mock('../../content/loader', () => ({
  loadContentIndex: () => loadContentIndex() as unknown,
}));
vitest.mock('../../progress/useProgress', () => ({
  useProgress: () => ({
    loading: false,
    snapshot: snapshot(),
    badges: [],
    doneByLesson: new Map(),
    streakDays: 0,
  }),
}));
vitest.mock('../../progress/db', () => ({
  quietly: (work: () => Promise<unknown>) => work(),
  toggleSaved: (id: string) => toggleSaved(id) as unknown,
}));

function lesson(n: number, tags: string[], exercises: [string, 'de' | 'vua'][]): LessonSummary {
  const id = `py.0${n}-bai`;
  return {
    id,
    slug: `0${n}-bai`,
    title: `Bài học ${n}`,
    concepts: ['x'],
    estimatedMinutes: 10,
    tags,
    status: 'draft',
    exerciseCount: exercises.length,
    exercises: exercises.map(([title, difficulty]) => ({
      id: `${id}.${title}`,
      title,
      difficulty,
    })),
    hasVideo: false,
    file: '',
  };
}

const lessons = [
  lesson(
    1,
    ['print'],
    [
      ['in-chao', 'de'],
      ['cay-thong', 'vua'],
    ],
  ),
  lesson(2, ['rùa'], [['ve-vuong', 'de']]),
];
const index: ContentIndex = {
  version: 1,
  courses: [
    {
      id: 'py',
      title: 'Python',
      summary: '',
      ageRange: [10, 15],
      level: 'moi-bat-dau',
      tags: [],
      illustration: 'py.svg',
      status: 'draft',
      chapters: [{ id: 'lam-quen', title: 'Làm quen', lessonIds: lessons.map((item) => item.id) }],
      lessons,
    },
  ],
};

function withProgress(done: string[], saved: string[] = []): ProgressSnapshot {
  return {
    schemaVersion: 1,
    profile: { id: 'me', createdAt: '', streakDays: 0, badges: [], saved },
    lessons: [],
    exercises: done.map((exerciseId) => ({
      exerciseId,
      lessonId: exerciseId.split('.').slice(0, 2).join('.'),
      status: 'xong' as const,
      attempts: 1,
      draftCode: '',
      updatedAt: '2026-11-09T10:00:00Z',
    })),
  };
}

function renderAt(path = '/luyen-tap') {
  const router = createMemoryRouter(
    [
      { path: '/luyen-tap', Component: PracticePage },
      { path: '/bai-tap/:id', element: <p>Màn bài tập</p> },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

afterEach(() => {
  vitest.useRealTimers();
});

beforeEach(() => {
  loadContentIndex.mockResolvedValue(index);
  snapshot.mockReturnValue(null);
  toggleSaved.mockResolvedValue([]);
});

describe('kho luyện tập /luyen-tap', () => {
  it('liệt kê mọi bài tập kèm bài học và độ khó; chưa làm bài nào thì mời bắt đầu', async () => {
    renderAt();
    const row = await screen.findByTestId('practice-py.01-bai.cay-thong');
    expect(row).toHaveTextContent('Bài 1 · Bài học 1');
    expect(row).toHaveTextContent('Vừa');
    expect(row).toHaveTextContent(strings.practice.notDone);
    expect(screen.getByTestId('practice-count')).toHaveTextContent('3 bài tập');
    expect(screen.getByTestId('practice-start')).toBeInTheDocument();
  });

  it('lọc "Dễ" ghi lên URL, có đếm cạnh lựa chọn', async () => {
    const router = renderAt();
    const [easy] = await screen.findAllByRole('checkbox', { name: /Dễ/ });
    expect(easy!.closest('label')).toHaveTextContent('2');
    await userEvent.click(easy!);
    expect(router.state.location.search).toBe('?do=de');
    expect(screen.getByTestId('practice-count')).toHaveTextContent('2 bài tập');
  });

  it('"Bài ngẫu nhiên" mở một bài chưa xong trong danh sách đang lọc', async () => {
    snapshot.mockReturnValue(withProgress(['py.01-bai.in-chao']));
    const router = renderAt('/luyen-tap?do=de');
    await userEvent.click(await screen.findByRole('button', { name: strings.practice.random }));
    expect(router.state.location.pathname).toBe('/bai-tap/py.02-bai.ve-vuong');
  });

  it('xong hết bài đang lọc thì "Bài ngẫu nhiên" khen thay vì mở bài', async () => {
    snapshot.mockReturnValue(withProgress(['py.01-bai.in-chao', 'py.02-bai.ve-vuong']));
    const router = renderAt('/luyen-tap?do=de');
    await userEvent.click(await screen.findByRole('button', { name: strings.practice.random }));
    expect(router.state.location.pathname).toBe('/luyen-tap');
    expect(screen.getByRole('status')).toHaveTextContent(strings.practice.randomNone);
  });

  it('nút "Để dành" ghi vào máy; bài đã để dành hiện là đang bấm', async () => {
    snapshot.mockReturnValue(withProgress([], ['py.02-bai.ve-vuong']));
    renderAt();
    const row = await screen.findByTestId('practice-py.01-bai.in-chao');
    await userEvent.click(within(row).getByRole('button', { name: /Để dành/ }));
    expect(toggleSaved).toHaveBeenCalledWith('py.01-bai.in-chao');
    expect(
      within(screen.getByTestId('practice-py.02-bai.ve-vuong')).getByRole('button', {
        name: /Để dành/,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('lọc không ra bài nào thì nói rõ và cho xoá lọc', async () => {
    const router = renderAt('/luyen-tap?de-danh=1');
    expect(await screen.findByText(strings.practice.empty)).toBeInTheDocument();
    await userEvent.click(
      screen.getAllByRole('button', { name: strings.practice.clearFilters }).at(-1)!,
    );
    expect(router.state.location.search).toBe('');
  });

  it('bấm một bộ bài để lọc theo chương, bấm lại để bỏ', async () => {
    const router = renderAt();
    const set = await screen.findByRole('button', { name: /Làm quen/ });
    expect(set).toHaveTextContent('0/3');
    await userEvent.click(set);
    expect(router.state.location.search).toBe('?bo=lam-quen');
    expect(set).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(set);
    expect(router.state.location.search).toBe('');
  });

  it('cột phải: "Tiếp tục" là bài chưa xong đầu tiên; lịch tô ngày có học kèm chữ', async () => {
    vitest.useFakeTimers({ toFake: ['Date'] });
    vitest.setSystemTime(new Date(2026, 10, 10, 9));
    snapshot.mockReturnValue(withProgress(['py.01-bai.in-chao']));
    renderAt();
    const next = await screen.findByTestId('practice-continue');
    expect(within(next).getByRole('link')).toHaveAttribute('href', '/bai-tap/py.01-bai.cay-thong');
    expect(screen.getByTestId('practice-challenge')).toBeInTheDocument();
    // Hôm nay giả lập là 10/11/2026; bài đã xong ghi lúc 9/11 → một ô "có học".
    const calendar = screen.getByTestId('practice-calendar');
    expect(calendar.querySelectorAll('[data-active]')).toHaveLength(1);
    expect(calendar.querySelector('[data-active]')).toHaveTextContent(
      `9${strings.practice.calendarActive}`,
    );
  });
});
