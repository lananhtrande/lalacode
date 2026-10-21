# 0001 — Giai đoạn 0 là web tĩnh, không lưu dữ liệu người dùng trên server
Trạng thái: Chấp nhận
Ngày: 2026-10-21

## Bối cảnh
Cần kiểm chứng nhu cầu (hoàn thành bài, quay lại, sẵn sàng trả phí) với chi phí thấp. Người dùng là trẻ em; pháp nhân dự kiến tại Việt Nam, thuộc diện lưu trữ dữ liệu trong nước (Nghị định 53/2022). Kiến trúc đích (EKS + PostgreSQL tại Local Zone Hà Nội) có chi phí sàn ~325 USD/tháng.

## Quyết định
Giai đoạn 0 chỉ gồm frontend tĩnh trên S3 + CloudFront và một hàm serverless không trạng thái cho gợi ý AI. Tiến độ học lưu trên máy (IndexedDB). Không tài khoản, không thanh toán.

## Hệ quả
- Tốt: chi phí ≈ 5–10 USD/tháng; gần như không có nghĩa vụ lưu trữ dữ liệu cá nhân; ra mắt nhanh.
- Xấu: mất tiến độ khi xoá dữ liệu trình duyệt; không có bảng xếp hạng chung; chưa thu tiền trên web. Giảm nhẹ bằng mã tiến độ và link báo cáo.

## Phương án đã cân nhắc
VPS + PostgreSQL ngay từ đầu (25–40 USD/tháng, nhưng phát sinh dữ liệu cá nhân và vận hành DB sớm); EKS (quá đắt cho beta).
