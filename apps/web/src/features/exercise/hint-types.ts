/** Mã lỗi do `services/ai-hint` trả về. Giữ đồng bộ bằng tay — hai bên không dùng chung code. */
export type HintErrorCode =
  | 'yeu-cau-khong-hop-le'
  | 'khong-co-bai-tap'
  | 'ai-dang-tat'
  | 'qua-nhieu-luot'
  | 'het-han-muc-ngay'
  | 'loi-he-thong';
