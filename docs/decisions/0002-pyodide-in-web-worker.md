# 0002 — Chạy và chấm code Python bằng Pyodide trong Web Worker
Trạng thái: Chấp nhận
Ngày: 2026-10-21

## Bối cảnh
Cần chạy Python thật cho trẻ mà không cài đặt, không tốn server, an toàn khi trẻ viết vòng lặp vô hạn.

## Quyết định
Dùng Pyodide (CPython → WebAssembly), phiên bản ghim cố định, **tự host** trên CloudFront. Chạy trong một Web Worker riêng; main thread giao tiếp qua protocol JSON có version. Timeout mặc định 5 s; hết giờ thì `terminate()` và tạo worker mới. Test ẩn chạy trong cùng worker sau code học sinh.

## Hệ quả
- Tốt: chi phí chạy code 0; phản hồi tức thì; cùng một runner dùng cho học sinh và (sau này) giáo viên soạn bài.
- Xấu: tải lần đầu ~10–12 MB (giảm bằng preload + cache dài hạn); test ẩn có thể bị xem qua DevTools — chấp nhận cho bài luyện tập, bài thi/xếp hạng sau này chấm lại trên server sandbox.

## Phương án đã cân nhắc
Skulpt/Brython (không phải CPython đầy đủ, khác hành vi SGK); Judge0 trên server (tốn tiền, cần vận hành); JupyterLite (quá nặng cho trẻ).
