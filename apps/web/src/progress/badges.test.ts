import { describe, expect, it } from 'vitest';
import { BADGE_RULES, evaluateBadges, mergeEarnedBadges, type BadgeId } from './badges';
import type { ExerciseProgress, ProgressSnapshot } from './schema';

const exercise = (id: string, overrides: Partial<ExerciseProgress> = {}): ExerciseProgress => ({
  exerciseId: id,
  lessonId: 'py-khoi-dong.01-xin-chao',
  status: 'xong',
  attempts: 1,
  draftCode: '',
  updatedAt: '2026-03-05T10:00:00.000Z',
  ...overrides,
});

const snapshot = (overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot => ({
  schemaVersion: 1,
  profile: {
    id: 'me',
    createdAt: '2026-03-01T00:00:00.000Z',
    streakDays: 0,
    badges: [],
  },
  lessons: [],
  exercises: [],
  ...overrides,
});

const earnedIds = (snap: ProgressSnapshot, today = '2026-03-05'): BadgeId[] =>
  evaluateBadges(snap, today)
    .filter((badge) => badge.earned)
    .map((badge) => badge.id);

describe('huy hiệu', () => {
  it('chưa làm gì thì chưa có huy hiệu nào', () => {
    expect(earnedIds(snapshot())).toEqual([]);
  });

  it('xong bài tập đầu tiên là có huy hiệu ngay buổi đầu', () => {
    expect(earnedIds(snapshot({ exercises: [exercise('e1')] }))).toContain('bai-dau-tien');
  });

  it('bài tập mới làm dở thì chưa tính', () => {
    const dangLam = exercise('e1', { status: 'dang-lam' });
    expect(earnedIds(snapshot({ exercises: [dangLam] }))).toEqual([]);
  });

  it('năm bài tập xong thì được huy hiệu thứ hai', () => {
    const exercises = ['e1', 'e2', 'e3', 'e4', 'e5'].map((id) => exercise(id));
    const ids = earnedIds(snapshot({ exercises }));
    expect(ids).toContain('nam-bai-tap');
    expect(ids).toContain('bai-dau-tien');
  });

  it('xong hẳn một bài học mới được huy hiệu bài học', () => {
    const chuaXong = snapshot({
      lessons: [{ lessonId: 'py-khoi-dong.01-xin-chao', courseId: 'py-khoi-dong', startedAt: 'x' }],
    });
    expect(earnedIds(chuaXong)).not.toContain('xong-bai-hoc');

    const xong = snapshot({
      lessons: [
        {
          lessonId: 'py-khoi-dong.01-xin-chao',
          courseId: 'py-khoi-dong',
          startedAt: 'x',
          completedAt: 'y',
        },
      ],
    });
    expect(earnedIds(xong)).toContain('xong-bai-hoc');
  });

  it('streak 3 và 7 ngày', () => {
    const ba = snapshot({
      profile: {
        id: 'me',
        createdAt: 'x',
        streakDays: 3,
        lastActiveDay: '2026-03-05',
        badges: [],
      },
    });
    expect(earnedIds(ba)).toContain('ba-ngay-lien');
    expect(earnedIds(ba)).not.toContain('bay-ngay-lien');

    const bay = snapshot({
      profile: {
        id: 'me',
        createdAt: 'x',
        streakDays: 7,
        lastActiveDay: '2026-03-05',
        badges: [],
      },
    });
    expect(earnedIds(bay)).toContain('bay-ngay-lien');
  });

  it('streak đã đứt thì không tính nữa cho huy hiệu mới', () => {
    const dut = snapshot({
      profile: {
        id: 'me',
        createdAt: 'x',
        streakDays: 7,
        lastActiveDay: '2026-02-20',
        badges: [],
      },
    });
    expect(earnedIds(dut, '2026-03-05')).not.toContain('ba-ngay-lien');
  });

  it('kiên trì: làm đạt sau nhiều lần thử', () => {
    const itLan = snapshot({ exercises: [exercise('e1', { attempts: 2 })] });
    expect(earnedIds(itLan)).not.toContain('kien-tri');

    const nhieuLan = snapshot({ exercises: [exercise('e1', { attempts: 5 })] });
    expect(earnedIds(nhieuLan)).toContain('kien-tri');
  });

  it('có thanh tiến trình "còn mấy bước nữa", không vượt quá mục tiêu', () => {
    const states = evaluateBadges(
      snapshot({ exercises: [exercise('e1'), exercise('e2')] }),
      '2026-03-05',
    );
    const namBai = states.find((badge) => badge.id === 'nam-bai-tap');
    expect(namBai).toMatchObject({ progress: 2, goal: 5, earned: false });

    const baiDau = states.find((badge) => badge.id === 'bai-dau-tien');
    expect(baiDau?.progress).toBe(1);
  });

  it('đủ sáu huy hiệu, không trùng mã', () => {
    expect(BADGE_RULES).toHaveLength(6);
    expect(new Set(BADGE_RULES.map((rule) => rule.id)).size).toBe(6);
  });
});

describe('mergeEarnedBadges', () => {
  it('huy hiệu đã nhận thì giữ mãi, kể cả khi streak đứt', () => {
    const saved = ['ba-ngay-lien'];
    const states = evaluateBadges(snapshot(), '2026-03-05');
    expect(mergeEarnedBadges(saved, states)).toEqual(['ba-ngay-lien']);
  });

  it('thêm huy hiệu mới mà không nhân đôi cái cũ', () => {
    const states = evaluateBadges(snapshot({ exercises: [exercise('e1')] }), '2026-03-05');
    const merged = mergeEarnedBadges(['bai-dau-tien'], states);
    expect(merged).toEqual(['bai-dau-tien']);
  });
});
