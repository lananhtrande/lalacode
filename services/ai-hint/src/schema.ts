import { z } from 'zod';

/**
 * Hợp đồng của `/api/hint`. Cố ý **hẹp hết mức**: chỉ đúng những trường trong
 * CLAUDE.md §3. Không nhận đề bài do client gửi — server tự tra theo
 * `exerciseId`, vì client là máy của trẻ, sửa được.
 */

export const MAX_CODE_LENGTH = 4000;
export const MAX_ERROR_LENGTH = 2000;

export const hintRequestSchema = z.strictObject({
  exerciseId: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+(?:\.\d{2}-[a-z0-9-]+){2}$/, 'exerciseId sai định dạng'),
  code: z.string().max(MAX_CODE_LENGTH),
  error: z.string().max(MAX_ERROR_LENGTH).optional(),
  hintLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** UUID ngẫu nhiên tạo trên máy, không gắn với danh tính; dùng để giới hạn lượt (S0-18). */
  token: z.string().uuid(),
});

export type HintRequest = z.infer<typeof hintRequestSchema>;

export interface HintResponse {
  hint: string;
  hintLevel: 1 | 2 | 3;
}

/** Mã lỗi trả về cho client — đủ để UI chọn câu tiếng Việt, không lộ chi tiết nội bộ. */
export type HintErrorCode =
  | 'yeu-cau-khong-hop-le'
  | 'khong-co-bai-tap'
  | 'ai-dang-tat'
  /** Trẻ này đã dùng hết lượt hôm nay. */
  | 'qua-nhieu-luot'
  /** Cả hệ thống hết hạn mức ngày — không phải lỗi của trẻ, UI nói khác đi. */
  | 'het-han-muc-ngay'
  | 'loi-he-thong';

export interface HintError {
  error: HintErrorCode;
}
