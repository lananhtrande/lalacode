/**
 * Lọc code của trẻ trước khi gửi cho AI.
 *
 * Trẻ hay gõ linh tinh vào chương trình: `print("Em tên là ... số đt ...")`.
 * Dữ liệu gửi cho Bedrock có thể được xử lý ngoài Việt Nam (ADR 0006), nên
 * những thứ trông giống thông tin cá nhân phải bị che **trước khi rời Lambda**
 * (docs/privacy.md §Cấm).
 */

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
/** Số điện thoại Việt Nam: 0xx hoặc +84, 9–11 chữ số, có thể có dấu cách/chấm/gạch. */
const PHONE = /(?:\+?84|0)(?:[\s.-]?\d){8,10}\b/g;
/** Dãy số dài (CCCD, số tài khoản…). */
const LONG_DIGITS = /\b\d{9,}\b/g;
const URL = /\bhttps?:\/\/\S+/g;

export const REDACTED = '[đã ẩn]';

export interface SanitizeResult {
  text: string;
  /** True nếu có thứ gì đó bị che — dùng để đếm, **không** để log nội dung. */
  redacted: boolean;
  truncated: boolean;
}

export function sanitizeForAi(input: string, maxLength: number): SanitizeResult {
  const truncated = input.length > maxLength;
  let text = truncated ? input.slice(0, maxLength) : input;

  const before = text;
  text = text
    .replaceAll(EMAIL, REDACTED)
    .replaceAll(URL, REDACTED)
    .replaceAll(PHONE, REDACTED)
    .replaceAll(LONG_DIGITS, REDACTED);

  return { text, redacted: text !== before, truncated };
}
