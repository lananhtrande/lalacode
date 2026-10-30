/**
 * Hình dạng dữ liệu tiến độ **nằm trên máy trẻ** (IndexedDB).
 *
 * Luật (docs/privacy.md): không có tên thật, email, SĐT, trường lớp, ngày sinh.
 * Không gì ở đây được gửi lên server. "Biệt danh" là tuỳ chọn, chỉ nằm trên máy
 * — hiện chưa có ô nhập trong UI, để sau quyết định.
 *
 * Tên trường cố ý đặt giống bảng PostgreSQL dự tính ở giai đoạn 1, để sau này
 * đồng bộ không phải đổi dữ liệu (docs/architecture.md §3).
 */

/**
 * Giữ tên cũ từ trước khi dự án đổi tên thành lalakode: đổi tên database là
 * tiến độ đã có trên máy trẻ coi như mất. Trẻ không bao giờ thấy tên này.
 */
export const DB_NAME = 'lalacode';

/** Tăng số này mỗi khi đổi hình dạng store; kèm một bước migrate có test. */
export const PROGRESS_SCHEMA_VERSION = 1;

export type ExerciseStatus = 'dang-lam' | 'xong';

export interface ExerciseProgress {
  exerciseId: string;
  lessonId: string;
  status: ExerciseStatus;
  /** Số lần bấm "Nộp bài". */
  attempts: number;
  /** Code gần nhất của trẻ, để mở lại bài là thấy nguyên như lúc rời đi. */
  draftCode: string;
  /** ISO 8601. */
  updatedAt: string;
  passedAt?: string;
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  startedAt: string;
  completedAt?: string;
}

export interface ProfileState {
  /** Luôn là `'me'`: mỗi máy một hồ sơ, không có tài khoản. */
  id: 'me';
  /** Tuỳ chọn, chỉ trên máy. Chưa có ô nhập trong UI. */
  nickname?: string;
  createdAt: string;
  /** Ngày hoạt động gần nhất, dạng `YYYY-MM-DD` theo giờ máy. */
  lastActiveDay?: string;
  /** Số ngày học liên tiếp tính tới `lastActiveDay`. */
  streakDays: number;
  /** Mã huy hiệu đã nhận (S0-13 định nghĩa danh sách). */
  badges: string[];
  /**
   * UUID ngẫu nhiên để giới hạn lượt gợi ý AI. **Không liên kết danh tính**:
   * server chỉ thấy `sha256` của nó (docs/privacy.md). Xoá dữ liệu là mất luôn.
   */
  aiToken?: string;
}

export const PROFILE_KEY = 'me' as const;

export interface ProgressSnapshot {
  schemaVersion: number;
  profile: ProfileState;
  lessons: LessonProgress[];
  exercises: ExerciseProgress[];
}
