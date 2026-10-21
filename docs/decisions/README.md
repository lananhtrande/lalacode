# Architecture Decision Records

Mỗi quyết định kiến trúc một file `NNNN-tieu-de.md`, không sửa nội dung cũ — muốn đổi thì viết ADR mới với `Trạng thái: Thay thế 000X`.

Mẫu:

```
# NNNN — Tiêu đề
Trạng thái: Đề xuất | Chấp nhận | Thay thế bởi NNNN
Ngày: YYYY-MM-DD

## Bối cảnh
## Quyết định
## Hệ quả (tốt / xấu)
## Phương án đã cân nhắc
```

| ADR | Tiêu đề | Trạng thái |
| --- | --- | --- |
| 0001 | Giai đoạn 0 là web tĩnh, không lưu dữ liệu người dùng trên server | Chấp nhận |
| 0002 | Chạy và chấm code Python bằng Pyodide trong Web Worker | Chấp nhận |
| 0003 | Nội dung bài học là dữ liệu JSON/Markdown có schema | Chấp nhận |
| 0004 | Gợi ý AI qua Lambda proxy không trạng thái + rate limit ẩn danh | Chấp nhận |
| 0005 | Analytics gộp không cookie | Đề xuất |
