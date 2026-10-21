import { describe, expect, it } from 'vitest';
import { advanceStreak, currentStreak, dayKey } from './streak';

describe('dayKey', () => {
  it('lấy ngày theo lịch máy, không theo UTC', () => {
    // 23:30 ngày 5/3 giờ máy vẫn là ngày 5/3, dù UTC đã sang hôm sau.
    const date = new Date(2026, 2, 5, 23, 30);
    expect(dayKey(date)).toBe('2026-03-05');
  });

  it('đệm 0 cho tháng và ngày một chữ số', () => {
    expect(dayKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('advanceStreak', () => {
  it('lần học đầu tiên: streak = 1', () => {
    expect(advanceStreak({ streakDays: 0 }, '2026-03-05')).toEqual({
      streakDays: 1,
      lastActiveDay: '2026-03-05',
    });
  });

  it('học thêm lần nữa trong cùng ngày thì vẫn là 1 ngày', () => {
    const after = advanceStreak({ streakDays: 3, lastActiveDay: '2026-03-05' }, '2026-03-05');
    expect(after.streakDays).toBe(3);
  });

  it('học hôm sau thì tăng 1', () => {
    expect(advanceStreak({ streakDays: 3, lastActiveDay: '2026-03-05' }, '2026-03-06')).toEqual({
      streakDays: 4,
      lastActiveDay: '2026-03-06',
    });
  });

  it('nghỉ một ngày thì bắt đầu lại từ 1', () => {
    expect(advanceStreak({ streakDays: 9, lastActiveDay: '2026-03-05' }, '2026-03-07')).toEqual({
      streakDays: 1,
      lastActiveDay: '2026-03-07',
    });
  });

  it('nối đúng qua cuối tháng và năm nhuận', () => {
    expect(
      advanceStreak({ streakDays: 2, lastActiveDay: '2026-01-31' }, '2026-02-01').streakDays,
    ).toBe(3);
    expect(
      advanceStreak({ streakDays: 2, lastActiveDay: '2024-02-28' }, '2024-02-29').streakDays,
    ).toBe(3);
    expect(
      advanceStreak({ streakDays: 2, lastActiveDay: '2026-12-31' }, '2027-01-01').streakDays,
    ).toBe(3);
  });

  it('đồng hồ máy bị chỉnh lùi thì không phá streak đang có', () => {
    const state = { streakDays: 5, lastActiveDay: '2026-03-05' };
    expect(advanceStreak(state, '2026-03-01')).toEqual(state);
  });
});

describe('currentStreak', () => {
  it('hôm nay hoặc hôm qua có học thì streak còn hiệu lực', () => {
    expect(currentStreak({ streakDays: 4, lastActiveDay: '2026-03-06' }, '2026-03-06')).toBe(4);
    expect(currentStreak({ streakDays: 4, lastActiveDay: '2026-03-05' }, '2026-03-06')).toBe(4);
  });

  it('nghỉ từ hai ngày thì coi như đứt', () => {
    expect(currentStreak({ streakDays: 4, lastActiveDay: '2026-03-04' }, '2026-03-06')).toBe(0);
  });

  it('chưa học buổi nào thì bằng 0', () => {
    expect(currentStreak({ streakDays: 0 }, '2026-03-06')).toBe(0);
  });
});
