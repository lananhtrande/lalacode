import { beforeEach, describe, expect, it, vi as vitest } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { CatalogPage } from './CatalogPage';
import { CoursePage } from './CoursePage';
import { vi as strings } from '../../shared/i18n/vi';
import type { ContentIndex, LessonSummary } from '../../content/types';

const loadContentIndex = vitest.fn();
const doneByLesson = vitest.fn<() => Map<string, number>>();

vitest.mock('../../content/loader', () => ({
  loadContentIndex: () => loadContentIndex() as unknown,
}));
vitest.mock('../../progress/useProgress', () => ({
  useProgress: () => ({
    loading: false,
    snapshot: null,
    badges: [],
    doneByLesson: doneByLesson(),
    streakDays: 0,
  }),
}));

function lesson(n: number): LessonSummary {
  const slug = `0${n}-bai-${n}`;
  return {
    id: `py-khoi-dong.${slug}`,
    slug,
    title: `Bài số ${n}`,
    concepts: ['print'],
    estimatedMinutes: 15,
    status: 'draft',
    exerciseCount: 2,
    hasVideo: false,
    file: `lessons/${slug}.json`,
  };
}

const lessons = [1, 2, 3, 4].map(lesson);
const index: ContentIndex = {
  version: 1,
  courses: [
    {
      id: 'py-khoi-dong',
      title: 'Python khởi động',
      summary: 'Bốn bài ngắn.',
      ageRange: [10, 15],
      level: 'moi-bat-dau',
      tags: [],
      illustration: 'py-khoi-dong.svg',
      status: 'draft',
      chapters: [
        { id: 'c1', title: 'Làm quen', lessonIds: [lessons[0]!.id, lessons[1]!.id] },
        { id: 'c2', title: 'Lặp lại', lessonIds: [lessons[2]!.id, lessons[3]!.id] },
      ],
      lessons,
    },
  ],
};

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/khoa-hoc', Component: CatalogPage },
      { path: '/khoa-hoc/:courseId', Component: CoursePage },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  loadContentIndex.mockResolvedValue(index);
  doneByLesson.mockReturnValue(new Map());
});

describe('catalog /khoa-hoc', () => {
  it('chưa học: thẻ có cấp độ, số bài, thời lượng, nút "Khám phá" tới trang khoá', async () => {
    renderAt('/khoa-hoc');
    const card = await screen.findByTestId('course-py-khoi-dong');
    expect(card).toHaveTextContent(strings.catalog.level['moi-bat-dau']);
    expect(card).toHaveTextContent('4 bài · khoảng 1 giờ');
    expect(within(card).queryByRole('progressbar')).toBeNull();
    expect(within(card).getByRole('link', { name: /Khám phá/ })).toHaveAttribute(
      'href',
      '/khoa-hoc/py-khoi-dong',
    );
    expect(screen.getByTestId('course-coming-soon')).toBeInTheDocument();
    expect(screen.getByTestId('course-count')).toHaveTextContent('1 khoá học');
  });

  it('đang học: nút chính "Tiếp tục bài N" tới bài đầu tiên chưa xong, có thanh tiến độ', async () => {
    doneByLesson.mockReturnValue(new Map([[lessons[0]!.id, 2]]));
    renderAt('/khoa-hoc');
    const card = await screen.findByTestId('course-py-khoi-dong');
    const cta = within(card).getByRole('link', { name: /Tiếp tục bài 2/ });
    expect(cta).toHaveAttribute('href', `/bai-hoc/${lessons[1]!.id}`);
    expect(cta.className).toContain('bg-accent');
    expect(within(card).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('xong hết: nút "Ôn lại"', async () => {
    doneByLesson.mockReturnValue(new Map(lessons.map((item) => [item.id, 2])));
    renderAt('/khoa-hoc');
    const card = await screen.findByTestId('course-py-khoi-dong');
    expect(within(card).getByRole('link', { name: /Ôn lại/ })).toBeInTheDocument();
  });

  it('bấm chip lọc thì ghi lên URL; lọc không ra thì mời xoá lọc', async () => {
    const router = renderAt('/khoa-hoc');
    await screen.findByTestId('course-py-khoi-dong');
    await userEvent.click(screen.getByRole('button', { name: strings.catalog.status['da-xong'] }));
    expect(router.state.location.search).toBe('?trang-thai=da-xong');
    expect(screen.getByRole('button', { name: strings.catalog.status['da-xong'] })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText(strings.catalog.empty)).toBeInTheDocument();
    expect(screen.queryByTestId('course-coming-soon')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: strings.catalog.clearFilters }));
    expect(router.state.location.search).toBe('');
    expect(await screen.findByTestId('course-py-khoi-dong')).toBeInTheDocument();
  });

  it('mở link có sẵn bộ lọc trên URL thì lọc ngay; tìm không dấu vẫn ra', async () => {
    renderAt('/khoa-hoc?tim=khoi%20dong&cap-do=moi-bat-dau');
    expect(await screen.findByTestId('course-py-khoi-dong')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: strings.catalog.searchLabel })).toHaveValue(
      'khoi dong',
    );
  });
});

describe('trang khoá /khoa-hoc/:courseId', () => {
  it('chưa học: nút chính "Bắt đầu" tới bài 1, chương đầu mở sẵn', async () => {
    renderAt('/khoa-hoc/py-khoi-dong');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Python khởi động' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: strings.course.start })).toHaveAttribute(
      'href',
      `/bai-hoc/${lessons[0]!.id}`,
    );
    expect(screen.getByTestId('course-done')).toHaveTextContent('0/4');
    expect(screen.getByTestId('chapter-c1')).toHaveAttribute('open');
    expect(screen.getByTestId('chapter-c2')).not.toHaveAttribute('open');
  });

  it('đang học ở chương 2: mở sẵn chương 2, mỗi bài có trạng thái bằng chữ', async () => {
    doneByLesson.mockReturnValue(
      new Map([
        [lessons[0]!.id, 2],
        [lessons[1]!.id, 2],
        [lessons[2]!.id, 1],
      ]),
    );
    renderAt('/khoa-hoc/py-khoi-dong');
    const chapter2 = await screen.findByTestId('chapter-c2');
    expect(chapter2).toHaveAttribute('open');
    expect(screen.getByTestId('chapter-c1')).toHaveTextContent('2/2 bài');
    expect(screen.getByTestId(`lesson-${lessons[0]!.id}`)).toHaveTextContent(strings.course.done);
    expect(screen.getByTestId(`lesson-${lessons[2]!.id}`)).toHaveTextContent(strings.course.doing);
    expect(screen.getByTestId(`progress-${lessons[2]!.id}`)).toHaveTextContent('1/2');
    expect(screen.getByRole('link', { name: /Tiếp tục bài 3/ })).toHaveAttribute(
      'href',
      `/bai-hoc/${lessons[2]!.id}`,
    );
  });

  it('khoá không có thì nói rõ và chỉ đường về danh sách khoá học', async () => {
    renderAt('/khoa-hoc/khong-co');
    expect(await screen.findByRole('heading', { name: strings.course.notFound })).toBeVisible();
    expect(screen.getByRole('link', { name: strings.course.backToCatalog })).toHaveAttribute(
      'href',
      '/khoa-hoc',
    );
  });
});
