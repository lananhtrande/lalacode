# 0005 — Analytics gộp không cookie
Trạng thái: Đề xuất (cần người duy trì chốt trước S0-26)
Ngày: 2026-10-21

## Bối cảnh
Cần đo tỉ lệ hoàn thành bài và tỉ lệ quay lại sau 7 ngày, nhưng không theo dõi từng trẻ.

## Đề xuất
Endpoint `/api/event` trên chính Lambda `ai-hint` (hoặc Lambda riêng) nhận `{event, lessonId, day}`; tăng bộ đếm trong DynamoDB theo khoá `event#lessonId#day`. Không ID, không IP lưu trữ. "Quay lại sau 7 ngày" tính trên máy: frontend tự biết lần học trước và chỉ gửi sự kiện `returned_after_7d` (không gửi ngày cụ thể của trẻ).

## Phương án cần so sánh
1. Tự làm bộ đếm như trên (rẻ, kiểm soát hoàn toàn).
2. Plausible/Umami tự host (đầy đủ hơn, nhưng cần server — thuộc giai đoạn 1).
3. Không analytics, chỉ khảo sát qua nhóm Zalo (đơn giản nhất, kém chính xác).

## Câu hỏi mở
Có cần báo rõ việc gửi sự kiện gộp trên trang quyền riêng tư và cho phép tắt không? (Đề xuất: có.)
