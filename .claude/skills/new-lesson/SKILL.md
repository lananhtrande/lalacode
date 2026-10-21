---
name: new-lesson
description: Create a new lesson (lesson.json, lesson.md, 3–5 exercises) in content/courses following docs/content-format.md, then verify and send it for review. Use when asked to write, add or draft a lesson or exercises.
---

# Tạo bài học mới

## 1. Làm rõ (hỏi nếu thiếu)
- Khoá học (`course-id`) và vị trí trong `order`.
- Khái niệm **duy nhất** của bài; trẻ đã học những gì trước đó (đọc các bài trước trong `order`).
- Có dùng `turtle` không; có video không (nếu có: provider + videoId do người dùng cung cấp — không tự bịa).

## 2. Tạo file
```
content/courses/<course-id>/lessons/<NN>-<slug>/
  lesson.json
  lesson.md
  exercises/<NN>-<slug>.json   (3–5 bài)
```
- `NN` hai chữ số, slug không dấu, chữ thường, gạch nối.
- `id` bài học = `<course-id>.<NN>-<slug>`; `id` bài tập = `id bài học` + `.` + tên file bỏ `.json`.
- Thêm `<NN>-<slug>` vào `order` của `course.json`. `status` để `"draft"`.
- `lesson.md`: ≤ 250 từ, 1 ví dụ code ngắn, kết thúc bằng lời mời làm bài.

## 3. Thiết kế bài tập (tăng dần)
1. Sửa 1 dòng trong starter là chạy đúng.
2. Viết lại tương tự với dữ liệu khác.
3. Kết hợp với kiến thức cũ.
4–5. (tuỳ chọn) mini-thử thách / `turtle`.

Mỗi bài tập: `solution` pass mọi test, `starterCode` fail ít nhất một test, đúng 3 `hints`, `message` thân thiện không lộ đáp án. Ưu tiên loại test đơn giản (`stdout_equals`, `function_returns`) trước `python_assert`.

## 4. Kiểm tra
```bash
npm run content:check
npm run content:verify
```
Nếu script chưa tồn tại (trước S0-02/S0-03): tự chạy `solution` bằng `python3 -c` để xác nhận output, và ghi chú rằng chưa có kiểm tra tự động.

## 5. Review
Gọi agent `content-reviewer` với danh sách file vừa tạo. Sửa theo mục "CẦN SỬA", rồi tóm tắt cho người dùng: tên bài, khái niệm, số bài tập, kết quả kiểm tra. Không tự đổi `status` sang `published`.
