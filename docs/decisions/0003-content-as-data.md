# 0003 — Nội dung bài học là dữ liệu JSON/Markdown có schema
Trạng thái: Chấp nhận
Ngày: 2026-10-21

## Bối cảnh
Sau này muốn có video bài giảng, khoá học của giáo viên và marketplace, nơi giáo viên tự tạo bài tập trên nền tảng luyện code.

## Quyết định
Bài học, bài tập là file trong `content/`, kiểm tra bằng zod schema dùng chung (`packages/content-schema`). Mỗi mục có `id` ổn định và `authorId`. Build gộp thành bundle JSON tĩnh có hash. CI bắt buộc `content:check` và `content:verify` (solution pass, starter fail bằng CPython).

## Hệ quả
- Tốt: tách nội dung khỏi code; một schema dùng lại cho trình soạn bài của giáo viên; lỗi nội dung bị chặn trước khi tới trẻ.
- Xấu: người viết nội dung cần biết JSON — giảm nhẹ bằng skill `new-lesson` và sau này là giao diện soạn bài.

## Phương án đã cân nhắc
MDX (trộn code React vào nội dung, khó cho giáo viên và khó validate); CMS headless (thêm dịch vụ, chi phí, dữ liệu ngoài kiểm soát).
