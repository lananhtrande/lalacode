/**
 * Log **chỉ những trường được phép** (docs/privacy.md §Cấm): thời gian, mã kết
 * quả, độ trễ, số token AI. Không bao giờ log body, code của trẻ, lỗi Python,
 * token người dùng, IP hay User-Agent.
 *
 * Viết hàm riêng thay vì gọi thẳng `console.log` để chỗ nào lỡ log thừa là
 * thấy ngay khi đọc code.
 */
export interface HintLogFields {
  outcome: string;
  durationMs: number;
  exerciseId?: string;
  hintLevel?: number;
  inputTokens?: number;
  outputTokens?: number;
  /** Có che thông tin giống dữ liệu cá nhân trong code không (đếm, không kèm nội dung). */
  redacted?: boolean;
}

export function logHint(fields: HintLogFields): void {
  // JSON một dòng cho CloudWatch dễ lọc. Đây là **chỗ duy nhất** trong service
  // được phép in ra; luật `no-console` vẫn giữ nguyên ở mọi nơi khác để không
  // ai lỡ để lại console.log gỡ rối kèm nội dung request.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ at: new Date().toISOString(), ...fields }));
}
