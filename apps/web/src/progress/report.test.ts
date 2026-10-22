import { describe, expect, it } from 'vitest';
import { formatDayVi, summarizeProgress } from './report';
import type { SharedProgress } from './share-code';
import type { ContentIndex } from '../content/types';

const index: ContentIndex = {
  version: 1,
  courses: [
    {
      id: 'py-khoi-dong',
      title: 'Python khởi động',
      summary: '',
      ageRange: [10, 15],
      status: 'draft',
      lessons: [
        {
          id: 'py-khoi-dong.01-xin-chao',
          slug: '01-xin-chao',
          title: 'Xin chào, Python!',
          concepts: ['print'],
          estimatedMinutes: 10,
          status: 'draft',
          exerciseCount: 2,
          hasVideo: false,
          file: 'lessons/x.json',
        },
      ],
    },
  ],
};

const progress = (overrides: Partial<SharedProgress> = {}): SharedProgress => ({
  schemaVersion: 1,
  profile: {
    id: 'me',
    createdAt: '2026-03-01T00:00:00.000Z',
    streakDays: 3,
    lastActiveDay: '2026-03-05',
    badges: ['bai-dau-tien', 'ba-ngay-lien'],
  },
  lessons: [
    {
      lessonId: 'py-khoi-dong.01-xin-chao',
      courseId: 'py-khoi-dong',
      startedAt: '2026-03-05T09:00:00.000Z',
    },
  ],
  exercises: [
    {
      exerciseId: 'py-khoi-dong.01-xin-chao.01-in-loi-chao',
      lessonId: 'py-khoi-dong.01-xin-chao',
      status: 'xong',
      attempts: 3,
      updatedAt: '2026-03-05T10:00:00.000Z',
      passedAt: '2026-03-05T10:00:00.000Z',
    },
    {
      exerciseId: 'py-khoi-dong.01-xin-chao.02-in-hai-dong',
      lessonId: 'py-khoi-dong.01-xin-chao',
      status: 'dang-lam',
      attempts: 2,
      updatedAt: '2026-03-05T10:30:00.000Z',
    },
  ],
  ...overrides,
});

describe('tóm tắt cho bố mẹ', () => {
  it('đếm bài tập đã xong, không đếm bài đang làm', () => {
    expect(summarizeProgress(progress(), index, '2026-03-05').exercisesDone).toBe(1);
  });

  it('cộng tổng số lần nộp bài của mọi bài tập', () => {
    expect(summarizeProgress(progress(), index, '2026-03-05').attempts).toBe(5);
  });

  it('bài học chỉ tính trọn vẹn khi có completedAt', () => {
    const chua = summarizeProgress(progress(), index, '2026-03-05');
    expect(chua.lessonsCompleted).toBe(0);
    expect(chua.lessons[0]?.completed).toBe(false);

    const xong = summarizeProgress(
      progress({
        lessons: [
          {
            lessonId: 'py-khoi-dong.01-xin-chao',
            courseId: 'py-khoi-dong',
            startedAt: 'x',
            completedAt: 'y',
          },
        ],
      }),
      index,
      '2026-03-05',
    );
    expect(xong.lessonsCompleted).toBe(1);
    expect(xong.lessons[0]?.completed).toBe(true);
  });

  it('lấy tên bài học từ mục lục nội dung', () => {
    const report = summarizeProgress(progress(), index, '2026-03-05');
    expect(report.lessons[0]).toMatchObject({
      title: 'Xin chào, Python!',
      doneCount: 1,
      totalCount: 2,
    });
  });

  it('không có mục lục thì vẫn ra số liệu, chỉ thiếu danh sách bài', () => {
    const report = summarizeProgress(progress(), null, '2026-03-05');
    expect(report.exercisesDone).toBe(1);
    expect(report.lessons).toEqual([]);
  });

  it('streak đã đứt thì báo 0, không khoe số cũ', () => {
    expect(summarizeProgress(progress(), index, '2026-03-20').streakDays).toBe(0);
    expect(summarizeProgress(progress(), index, '2026-03-06').streakDays).toBe(3);
  });

  it('chưa học gì thì mọi số đều 0 và không ném lỗi', () => {
    const report = summarizeProgress(
      progress({
        lessons: [],
        exercises: [],
        profile: { id: 'me', createdAt: 'x', streakDays: 0, badges: [] },
      }),
      index,
      '2026-03-05',
    );
    expect(report).toMatchObject({
      exercisesDone: 0,
      lessonsCompleted: 0,
      badgeCount: 0,
      attempts: 0,
      lastActiveDay: '',
    });
  });

  it('báo cáo tuyệt đối không mang code của trẻ', () => {
    const report = summarizeProgress(progress(), index, '2026-03-05');
    expect(JSON.stringify(report)).not.toMatch(/print\(|draftCode/);
  });
});

describe('formatDayVi', () => {
  it('đổi sang kiểu ngày quen thuộc ở Việt Nam', () => {
    expect(formatDayVi('2026-03-05')).toBe('05/03/2026');
  });

  it('chuỗi lạ thì giữ nguyên, không ném lỗi', () => {
    expect(formatDayVi('hôm qua')).toBe('hôm qua');
  });
});
