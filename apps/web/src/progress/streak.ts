/**
 * Tính chuỗi ngày học liên tiếp. Hàm thuần, không đụng đồng hồ hệ thống:
 * người gọi truyền "hôm nay" vào, nên test được mọi mốc thời gian.
 *
 * Dùng ngày **theo giờ máy** (trẻ ở Việt Nam dùng giờ Việt Nam), không dùng UTC:
 * học lúc 23h hôm nay và 7h sáng mai phải tính là hai ngày liền nhau.
 */

/** `YYYY-MM-DD` theo lịch địa phương của máy. */
export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(from: string, to: string): number {
  const [fromYear = 0, fromMonth = 1, fromDay = 1] = from.split('-').map(Number);
  const [toYear = 0, toMonth = 1, toDay = 1] = to.split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export interface StreakState {
  streakDays: number;
  lastActiveDay?: string;
}

/**
 * Trả về streak mới khi trẻ học vào `today`.
 * - Cùng ngày: giữ nguyên (học nhiều lần trong ngày vẫn là một ngày).
 * - Hôm sau: +1.
 * - Nghỉ từ hai ngày trở lên: bắt đầu lại từ 1.
 */
export function advanceStreak(state: StreakState, today: string): StreakState {
  if (state.lastActiveDay === undefined) return { streakDays: 1, lastActiveDay: today };
  const gap = daysBetween(state.lastActiveDay, today);
  if (gap === 0) return { streakDays: Math.max(1, state.streakDays), lastActiveDay: today };
  if (gap === 1) return { streakDays: state.streakDays + 1, lastActiveDay: today };
  // Ngày lùi về quá khứ (đồng hồ máy bị chỉnh) thì không phá streak đang có.
  if (gap < 0) return state;
  return { streakDays: 1, lastActiveDay: today };
}

/** Streak hiển thị hôm nay: nghỉ quá một ngày thì coi như đã đứt. */
export function currentStreak(state: StreakState, today: string): number {
  if (state.lastActiveDay === undefined) return 0;
  const gap = daysBetween(state.lastActiveDay, today);
  return gap <= 1 && gap >= 0 ? state.streakDays : 0;
}
