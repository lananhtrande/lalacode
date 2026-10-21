# 0004 — Gợi ý AI qua Lambda proxy không trạng thái + rate limit ẩn danh
Trạng thái: Chấp nhận — phần nhà cung cấp model được thay bởi 0006
Ngày: 2026-10-21

## Bối cảnh
API key không được nằm ở trình duyệt. Cần giới hạn chi phí mà không có tài khoản, và không thu dữ liệu cá nhân của trẻ.

## Quyết định
AWS Lambda (Node 22) sau CloudFront tại `/api/hint`. Input chỉ gồm `exerciseId`, `code` (≤ 4 kB, đã lọc), `error` (≤ 2 kB), `hintLevel`, `token` (UUID ngẫu nhiên trên máy). Server lấy đề bài theo `exerciseId` từ bundle nội dung. Model `claude-haiku-5-5`, `max_tokens` ~400. Rate limit: DynamoDB lưu `sha256(token)#YYYY-MM-DD`, TTL 48 h, 5 lượt/ngày/token + trần toàn cục/ngày. Không log body. Công tắc `AI_HINTS_ENABLED`.

## Hệ quả
- Tốt: chi phí AI ~0,0004 USD/lượt; không có dữ liệu nhận dạng trẻ; tắt được ngay khi có sự cố.
- Xấu: người lách token có thể dùng thêm lượt — trần toàn cục chặn rủi ro chi phí. Gọi API AI ở nước ngoài có thể cần thủ tục chuyển dữ liệu xuyên biên giới khi có pháp nhân — hỏi luật sư; giảm thiểu bằng cách không gửi dữ liệu cá nhân.

## Phương án đã cân nhắc
Cloudflare Worker + KV (rẻ, nhưng tách khỏi hệ AWS dùng ở giai đoạn sau); gọi AI trực tiếp từ trình duyệt (lộ key — loại).
