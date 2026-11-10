import { afterEach, beforeEach, describe, expect, it, vi as vitest } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { LearnLayout } from './LearnLayout';
import { TopbarSlot } from './topbar-slot';
import { vi as strings } from '../../shared/i18n/vi';
import type { ContentIndex, LessonSummary } from '../../content/types';
import type { ProgressSnapshot } from '../../progress/schema';

const loadContentIndex = vitest.fn();
const snapshot = vitest.fn<() => ProgressSnapshot | null>();

vitest.mock('../../content/loader', () => ({
  loadContentIndex: () => loadContentIndex() as unknown,
  lessonIdOfExercise: (id: string) => id.split('.').slice(0, 2).join('.'),
}));
vitest.mock('../../progress/useProgress', () => ({
  useProgress: () => {
    const value = snapshot();
    const doneByLesson = new Map<string, number>();
    for (const exercise of value?.exercises ?? []) {
      if (exercise.status === 'xong') {
        doneByLesson.set(exercise.lessonId, (doneByLesson.get(exercise.lessonId) ?? 0) + 1);
      }
    }
    return { loading: false, snapshot: value, badges: [], doneByLesson, streakDays: 0 };
  },
}));

function lesson(n: number, exercises: string[]): LessonSummary {
  const id = `py.0${n}-bai-${n}`;
  return {
    id,
    slug: `0${n}-bai-${n}`,
    title: `Bài số ${n}`,
    concepts: ['print'],
    estimatedMinutes: 10,
    status: 'draft',
    exerciseCount: exercises.length,
    exercises: exercises.map((title, index) => ({ id: `${id}.0${index + 1}-bt`, title })),
    hasVideo: n === 1,
    file: `lessons/${id}.json`,
  };
}

const lessons = [lesson(1, ['Chào', 'Hai dòng']), lesson(2, ['Biến']), lesson(3, ['Rùa'])];
const index: ContentIndex = {
  version: 1,
  courses: [
    {
      id: 'py',
      title: 'Python khởi động',
      summary: '',
      ageRange: [10, 15],
      level: 'moi-bat-dau',
      tags: [],
      illustration: 'py.svg',
      status: 'draft',
      chapters: [
        { id: 'c1', title: 'Làm quen', lessonIds: [lessons[0]!.id, lessons[1]!.id] },
        { id: 'c2', title: 'Vẽ', lessonIds: [lessons[2]!.id] },
      ],
      lessons,
    },
  ],
};

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        Component: LearnLayout,
        children: [
          { path: '/bai-hoc/:lessonId', element: <p>Trang bài học</p> },
          {
            path: '/bai-tap/:exerciseId',
            element: (
              <TopbarSlot>
                <span data-testid="python-status">Python sẵn sàng</span>
              </TopbarSlot>
            ),
          },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  loadContentIndex.mockResolvedValue(index);
  snapshot.mockReturnValue(null);
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('khung học bài', () => {
  it('mục lục: chương của bài đang mở được mở sẵn, mục đang mở có aria-current', async () => {
    renderAt(`/bai-tap/${lessons[0]!.id}.02-bt`);
    const sidebar = await screen.findByTestId('learn-sidebar');
    // Màn bài tập: sidebar mặc định thu gọn để editor rộng.
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await userEvent.click(within(sidebar).getByRole('button', { name: strings.learn.expand }));
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');

    const outline = within(sidebar).getByRole('navigation', { name: strings.learn.outline });
    const current = within(outline).getByRole('link', { current: 'page' });
    expect(current).toHaveTextContent('Hai dòng');
    expect(current).toHaveAttribute('href', `/bai-tap/${lessons[0]!.id}.02-bt`);
    expect(screen.getByTestId('outline-c1')).toHaveAttribute('open');
    expect(screen.getByTestId('outline-c2')).not.toHaveAttribute('open');
  });

  it('thu gọn/mở được lưu lại, riêng cho màn bài học', async () => {
    renderAt(`/bai-hoc/${lessons[1]!.id}`);
    const sidebar = await screen.findByTestId('learn-sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await userEvent.click(within(sidebar).getByRole('button', { name: strings.learn.collapse }));
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(window.localStorage.getItem('lalakode.learn-sidebar.bai-hoc')).toBe('thu-gon');
  });

  it('mục đã xong có chữ ẩn "Đã xong" cho trình đọc màn hình; tiến độ khoá theo bài học', async () => {
    snapshot.mockReturnValue({
      exercises: [
        {
          exerciseId: `${lessons[1]!.id}.01-bt`,
          lessonId: lessons[1]!.id,
          status: 'xong',
          attempts: 1,
          draftCode: '',
          updatedAt: '',
        },
      ],
    } as unknown as ProgressSnapshot);
    renderAt(`/bai-hoc/${lessons[1]!.id}`);
    const sidebar = await screen.findByTestId('learn-sidebar');
    const done = within(sidebar).getByRole('link', { name: /Biến/ });
    expect(done).toHaveTextContent(strings.learn.done);
    expect(within(sidebar).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
    expect(sidebar).toHaveTextContent('1/3 bài · 33%');
  });

  it('topbar: breadcrumb vị trí, bộ đếm bài và bài tập, chỗ cho trạng thái Python', async () => {
    renderAt(`/bai-tap/${lessons[0]!.id}.02-bt`);
    const crumbs = await screen.findByRole('navigation', { name: strings.learn.breadcrumb });
    expect(within(crumbs).getByRole('link', { name: 'Khoá học' })).toHaveAttribute(
      'href',
      '/khoa-hoc',
    );
    expect(within(crumbs).getByRole('link', { name: 'Python khởi động' })).toHaveAttribute(
      'href',
      '/khoa-hoc/py',
    );
    expect(within(crumbs).getByRole('link', { name: 'Bài 1 · Bài số 1' })).toHaveAttribute(
      'href',
      `/bai-hoc/${lessons[0]!.id}`,
    );
    expect(screen.getByTestId('lesson-counter')).toHaveTextContent('Bài 1/3');
    expect(screen.getByTestId('exercise-counter')).toHaveTextContent('Bài tập 2/2');
    expect(within(screen.getByRole('banner')).getByTestId('python-status')).toBeInTheDocument();
  });

  it('ngăn kéo mục lục (màn hẹp): Esc thì đóng và trả focus về nút "Mục lục"', async () => {
    renderAt(`/bai-hoc/${lessons[0]!.id}`);
    const toggle = await screen.findByRole('button', { name: strings.learn.openOutline });
    await userEvent.click(toggle);
    const drawer = await screen.findByRole('dialog', { name: strings.learn.outline });
    expect(within(drawer).getByRole('button', { name: strings.learn.closeOutline })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(toggle).toHaveFocus();
  });

  it('bấm một mục trong ngăn kéo thì ngăn kéo đóng lại', async () => {
    const router = renderAt(`/bai-hoc/${lessons[0]!.id}`);
    await userEvent.click(await screen.findByRole('button', { name: strings.learn.openOutline }));
    const drawer = await screen.findByRole('dialog');
    await userEvent.click(within(drawer).getByRole('link', { name: /Biến/ }));
    expect(router.state.location.pathname).toBe(`/bai-tap/${lessons[1]!.id}.01-bt`);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
