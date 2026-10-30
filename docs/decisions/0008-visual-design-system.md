# 0008 — Design system riêng: một màu nhấn, font Be Vietnam Pro, chỉ giao diện sáng
Trạng thái: Chấp nhận
Ngày: 2026-10-30

## Bối cảnh
Giao diện giai đoạn 0 được dựng nhanh: xanh biển làm màu chính, vàng cam cho huy hiệu, font hệ thống, có chế độ tối, mỗi nút tự viết class riêng. Trẻ 10–15 tuổi cần biết ngay **phải bấm đâu**, đọc được chữ tiếng Việt có dấu rõ ràng, và phân biệt được đâu là gợi ý của AI.

Người duy trì đã xem một bản thiết kế tham khảo và rút ra 7 nguyên lý (`docs/prompts/2026-10-30-ui-redesign.md`). Yêu cầu là **học nguyên lý, không chép**: không lấy màu, font, tên component hay bố cục nào của bản đó.

## Quyết định

**Nguyên lý giữ lại:**
1. Nền trung tính, **một màu nhấn duy nhất** cho hành động chính và mục đang chọn.
2. Tương phản cao: chữ gần đen trên trắng; nút chính có chữ tối trên màu nhấn sáng.
3. Hình khối mềm: nút dạng viên thuốc, thẻ bo 16px, bóng rất nhẹ.
4. Sáu kiểu chữ đặt tên theo vai trò.
5. Nền riêng cho mọi thứ do AI tạo ra.
6. Màu trạng thái có nghĩa cố định, luôn kèm icon và chữ.
7. Khung trang dạng sidebar trên màn rộng.

**Bảng màu "Ngọc biển"** (người duy trì chọn giữa hai phương án ở `/dev/design`): màu nhấn xanh ngọc `#2DD4BF`, chữ trên nút `#06302B`. Khác bản tham khảo (vàng chanh): xanh ngọc mát mắt, trung tính về giới, và tách hẳn khỏi màu "đúng" (xanh lá đậm) và "cần chú ý" (hổ phách). Màu nhấn sáng không đạt AA làm chữ trên nền trắng, nên có thêm `accent-strong` `#0F766E` cho link và chữ. Phương án bị loại: "San hô" (cam `#FF7A59`), vui hơn nhưng quá gần màu "cần chú ý".

**Font Be Vietnam Pro** (OFL), tự host trong `apps/web/public/fonts/`, 3 độ đậm (400/600/700) × 3 bảng chữ (latin, latin-ext, vietnamese) chia theo `unicode-range`, `font-display: swap`. Được thiết kế cho tiếng Việt: dấu chồng (Ổ, ầ, ừ) gọn, không đụng dòng trên. Đã so với Lexend (dễ đọc nhưng rộng, tiêu đề hay xuống dòng) và Nunito (tròn, thân thiện nhưng mềm ở cỡ nhỏ).

**Chỉ giao diện sáng** ở giai đoạn 0: bỏ khối `prefers-color-scheme: dark`, đặt `color-scheme: light`. Một bộ màu thì test tương phản và chụp màn hình đơn giản hơn một nửa. Ngoại lệ: editor code và console **luôn tối** (S0-32), tự khai báo màu riêng.

**Token theo vai trò** trong `@theme` của `index.css` (`ink`, `ink-soft`, `surface`, `surface-muted`, `line`, `accent`, `on-accent`, `accent-strong`, `accent-soft`, `ai-surface`, `success`, `attention` + nền của hai màu trạng thái). Component dùng chung: `Button`/`ButtonLink` (primary, dark, outline, ghost), `IconButton`, `Card`, `AiPanel`.

## Hệ quả
- Tốt: mọi cặp chữ/nền được **test đọc thẳng từ `index.css`** và đòi ≥ 4.5:1 — đổi màu làm hỏng tương phản là CI đỏ.
- Tốt: đổi bảng màu sau này chỉ sửa token, không sửa class ở các màn.
- Tốt: font tự host nên không có request nào tới Google Fonts hay CDN (docs/privacy.md).
- Xấu: thêm ~160 kB font trong `dist/` (mỗi trang chỉ tải bảng chữ nó cần, thường 3 file latin + 3 file vietnamese). Không nằm trong JS nên không ảnh hưởng ngân sách bundle.
- Xấu: trẻ quen dùng máy ở chế độ tối sẽ thấy trang sáng. Chấp nhận ở giai đoạn 0; muốn thêm lại thì viết ADR mới, ghi đè chính các token này.

## Phương án đã cân nhắc
- **Giữ font hệ thống:** 0 kB, nhưng hiển thị dấu tiếng Việt khác nhau giữa Windows, Android, iOS; không có bản sắc riêng.
- **Tải font từ Google Fonts:** gửi IP và trang đang xem của trẻ cho bên thứ ba — trái `docs/privacy.md`.
- **Giữ chế độ tối cho cả khung trang:** gấp đôi số màu phải kiểm tương phản và số ảnh phải soát, trong khi beta chưa có ai phản hồi cần nó.
