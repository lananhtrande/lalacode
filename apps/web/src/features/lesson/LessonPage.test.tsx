import { afterEach, beforeEach, describe, expect, it, vi as vitest } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { LessonPage } from './LessonPage';
import { stripLeadingTitle } from './LessonBody';
import { vi as strings } from '../../shared/i18n/vi';
import type { LessonBundle } from '../../content/types';
import type { ExerciseProgress, ProgressSnapshot } from '../../progress/schema';

const loadLesson = vitest.fn();
const progress = vitest.fn();

vitest.mock('../../content/loader', () => ({
  loadLesson: (...args: unknown[]) => loadLesson(...args) as unknown,
}));
vitest.mock('../../progress/useProgress', () => ({
  useProgress: () => progress() as unknown,
}));

const bundle: LessonBundle = {
  version: 1,
  lesson: {
    id: 'py-khoi-dong.03-rua-ve-hinh',
    title: 'Rùa vẽ hình',
    concepts: ['turtle'],
    estimatedMinutes: 12,
    exercises: ['01-di-thang', '02-ve-vuong'],
    status: 'draft',
  },
  markdown: '# Rùa vẽ hình\n\nRùa cầm bút.\n\n- `forward(100)` đi thẳng.\n',
  exercises: [
    { id: 'py-khoi-dong.03-rua-ve-hinh.01-di-thang', title: 'Đi thẳng' },
    { id: 'py-khoi-dong.03-rua-ve-hinh.02-ve-vuong', title: 'Vẽ hình vuông' },
  ] as unknown as LessonBundle['exercises'],
};

function snapshotWith(statuses: Record<string, ExerciseProgress['status']>): ProgressSnapshot {
  return {
    schemaVersion: 1,
    profile: { id: 'me', createdAt: '2026-01-01T00:00:00.000Z', streakDays: 0, badges: [] },
    lessons: [],
    exercises: Object.entries(statuses).map(([exerciseId, status]) => ({
      exerciseId,
      lessonId: 'py-khoi-dong.03-rua-ve-hinh',
      status,
      attempts: 1,
      draftCode: '',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })),
  };
}

function renderPage() {
  return render(
    <RouterProvider
      router={createMemoryRouter(
        [{ path: '/bai-hoc/:lessonId', Component: LessonPage }],
        { initialEntries: ['/bai-hoc/py-khoi-dong.03-rua-ve-hinh'] },
      )}
    />,
  );
}

beforeEach(() => {
  loadLesson.mockResolvedValue(bundle);
  progress.mockReturnValue({ snapshot: null });
});
afterEach(() => vitest.clearAllMocks());

describe('màn bài học', () => {
  it('hiện tiêu đề, nội dung Markdown và danh sách bài tập', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Rùa vẽ hình', level: 1 })).toBeVisible();
    expect(screen.getByTestId('lesson-body')).toHaveTextContent('Rùa cầm bút.');
    // `forward(100)` trong dấu nháy ngược phải thành thẻ code, không phải dấu nháy.
    expect(screen.getByTestId('lesson-body').querySelector('code')).toHaveTextContent(
      'forward(100)',
    );
    const links = screen.getByTestId('lesson-exercises').querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute(
      'href',
      '/bai-tap/py-khoi-dong.03-rua-ve-hinh.01-di-thang',
    );
  });

  it('chưa làm bài nào thì nút mời bắt đầu từ bài đầu tiên', async () => {
    renderPage();
    const cta = await screen.findByTestId('lesson-cta');
    expect(cta).toHaveTextContent(strings.lesson.startFirst);
    expect(cta).toHaveAttribute('href', '/bai-tap/py-khoi-dong.03-rua-ve-hinh.01-di-thang');
  });

  it('làm dở thì nút đưa thẳng tới bài chưa xong', async () => {
    progress.mockReturnValue({
      snapshot: snapshotWith({ 'py-khoi-dong.03-rua-ve-hinh.01-di-thang': 'xong' }),
    });
    renderPage();
    const cta = await screen.findByTestId('lesson-cta');
    expect(cta).toHaveTextContent(strings.lesson.continueNext);
    expect(cta).toHaveAttribute('href', '/bai-tap/py-khoi-dong.03-rua-ve-hinh.02-ve-vuong');
  });

  it('xong hết thì khen, không còn nút làm tiếp', async () => {
    progress.mockReturnValue({
      snapshot: snapshotWith({
        'py-khoi-dong.03-rua-ve-hinh.01-di-thang': 'xong',
        'py-khoi-dong.03-rua-ve-hinh.02-ve-vuong': 'xong',
      }),
    });
    renderPage();
    expect(await screen.findByTestId('lesson-all-done')).toHaveTextContent(strings.lesson.allDone);
    expect(screen.queryByTestId('lesson-cta')).not.toBeInTheDocument();
  });

  it('bài học không có thì nói rõ và chỉ đường về bản đồ', async () => {
    loadLesson.mockRejectedValue(new Error('không có'));
    renderPage();
    expect(await screen.findByRole('heading', { name: strings.lesson.notFound })).toBeVisible();
    expect(screen.getByRole('link', { name: strings.lesson.backToMap })).toHaveAttribute(
      'href',
      '/ban-do',
    );
  });

  it('bài không có video thì không nhúng gì cả', async () => {
    renderPage();
    await screen.findByTestId('lesson-body');
    expect(screen.queryByTestId('lesson-video')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lesson-video-play')).not.toBeInTheDocument();
  });
});

describe('stripLeadingTitle', () => {
  it('bỏ đúng dòng tiêu đề mở đầu, giữ nguyên tiêu đề giữa bài', () => {
    expect(stripLeadingTitle('# Tiêu đề\n\nThân bài\n')).toBe('Thân bài\n');
    expect(stripLeadingTitle('Thân bài\n\n# Giữa bài\n')).toBe('Thân bài\n\n# Giữa bài\n');
  });
});
