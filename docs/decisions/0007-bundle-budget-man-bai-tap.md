# 0007 — Nới ngân sách bundle cho riêng màn bài tập
Trạng thái: Chấp nhận
Ngày: 2026-10-21

## Bối cảnh
`docs/tech-stack.md` đặt ngân sách "mỗi route lazy ≤ 80 kB gzip". Khi làm màn bài tập (S0-11), đo thật:

| Thứ | gzip |
| --- | --- |
| Màn bài tập, không có editor | ~7 kB |
| CodeMirror 6 + `@codemirror/lang-python` | ~124 kB |
| **Tổng chunk `/bai-tap/*`** | **~131 kB** |

Đã bỏ `basicSetup` (kéo theo gợi ý code, tìm kiếm, lint, gập code — trẻ mới học không cần) và tự ghép bộ extension tối thiểu: 161 kB → 131 kB gzip. Không còn chỗ cắt đáng kể nếu vẫn muốn tô màu cú pháp Python thật.

## Quyết định
Giữ CodeMirror. Ngân sách tách làm hai:

- Route thường: **≤ 80 kB gzip** (giữ nguyên).
- Route bài tập (`/bai-tap/*`): **≤ 150 kB gzip**, vì nó chứa cả editor.
- JS chính (không tính Pyodide, không tính editor): ≤ 200 kB gzip — giữ nguyên, hiện ~104 kB.

## Hệ quả
- Tốt: trẻ có tô màu cú pháp, số dòng, hoàn tác, thụt dòng thông minh — những thứ giúp đọc code dễ hơn hẳn `<textarea>`.
- Phải chấp nhận: màn bài tập nặng hơn các màn khác. Đặt trong bối cảnh thì nhỏ: **cùng màn hình đó đã tải ~13 MB Pyodide**, nên editor chiếm khoảng 1% lượng tải, và nó nằm ở chunk riêng có hash, cache vĩnh viễn.
- Chỉ màn bài tập mới nặng; trang chủ, bản đồ, báo cáo vẫn trong ngân sách cũ.

## Phương án đã cân nhắc
- **`<textarea>` thuần** (~0 kB): nhẹ nhất, nhưng không có số dòng và tô màu — trẻ 10–15 tuổi khó dò lỗi thụt dòng, mà thụt dòng chính là chỗ hay sai nhất khi học Python.
- **Giữ `basicSetup`** (~161 kB): tiện nhưng thêm gợi ý code và tìm kiếm, vừa nặng vừa rối cho người mới.
- **Tự viết editor tô màu** : rẻ về byte, đắt về thời gian và lỗi; không đáng ở giai đoạn 0.
