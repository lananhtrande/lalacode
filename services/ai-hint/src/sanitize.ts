/**
 * Lọc code của trẻ trước khi gửi cho AI.
 *
 * Trẻ hay gõ linh tinh vào chương trình: `print("Em tên là ... số đt ...")`.
 * Dữ liệu gửi cho Bedrock có thể được xử lý ngoài Việt Nam (ADR 0006), nên
 * những thứ trông giống thông tin cá nhân phải bị che **trước khi rời Lambda**
 * (docs/privacy.md §Cấm).
 */

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
/**
 * Trẻ hay tự giới thiệu trong chính chuỗi in ra: "Em tên là …", "nhà ở …",
 * "học lớp …". Che phần đứng sau các cụm đó.
 *
 * Đây là **đoán theo mẫu, không phải bảo đảm**: không regex nào nhận ra một cái
 * tên viết trơ trọi. Giới hạn này được ghi rõ trong docs/privacy.md, và panel
 * gợi ý (S0-19) sẽ nhắc trẻ đừng gõ tên thật vào code.
 */
const SELF_INTRO =
  /((?:tên|tên là|tôi tên|em tên|mình tên|con tên|họ tên|nhà ở|địa chỉ|học lớp|lớp|trường)\s*(?:là|:)?\s+)([^\n"')]{1,40})/gi;
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
    .replaceAll(LONG_DIGITS, REDACTED)
    .replaceAll(SELF_INTRO, (_match, lead: string) => `${lead}${REDACTED}`);

  return { text, redacted: text !== before, truncated };
}
