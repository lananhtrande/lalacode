/** Quy tắc đặt tên thư mục/file và `id` của nội dung (xem docs/content-format.md). */

/** `py-khoi-dong` — chữ thường, số, gạch ngang. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `01-xin-chao` — hai chữ số thứ tự rồi tới slug. */
export const NUMBERED_SLUG = /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Tên biến/hàm hợp lệ trong Python. */
export const PY_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function lessonId(courseId: string, lessonDir: string): string {
  return `${courseId}.${lessonDir}`;
}

export function exerciseId(lessonIdValue: string, exerciseFile: string): string {
  return `${lessonIdValue}.${exerciseFile}`;
}
