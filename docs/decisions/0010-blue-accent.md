# 0010 — Màu nhấn xanh dương; San hô chỉ còn ở logo
Trạng thái: Chấp nhận
Ngày: 2026-11-05
Thay một phần: ADR 0009 (màu nhấn San hô). Font Inter, logo và màu "cần chú ý" của 0009 giữ nguyên.

## Bối cảnh
Sau S0-34, người duy trì dùng thử và thấy **San hô trên nút và icon dễ bị trẻ nhầm với báo lỗi**: nút "Nộp bài", link, icon nhấn và khung lỗi đều thuộc nhóm đỏ-cam-vàng ấm. Tách màu "cần chú ý" sang mù tạt (ADR 0009) là chưa đủ: với trẻ, cả bảng màu ấm đều đọc là "cẩn thận".

Logo San hô (biểu tượng chữ "ơ") đã chốt và giữ nguyên.

## Quyết định

**Quy tắc "San hô chỉ ở logo".** `#E8553A` chỉ xuất hiện trong các file logo/favicon/icon ở `apps/web/public/` (sinh từ `docs/brand/build-logo.mjs`). Không nút, link, trạng thái, icon hay nền nào trong giao diện dùng San hô hay một sắc đỏ/cam. Màu ấm duy nhất của giao diện là mù tạt `attention` cho "cần chú ý".

**Màu nhấn xanh dương** — rõ, cảm giác đáng tin, nằm ở phía lạnh của vòng màu, xa hẳn mọi màu trạng thái:

| Token | Giá trị | Ghi chú |
| --- | --- | --- |
| `accent` | `#2563EB` | Nút chính, mục đang chọn |
| `on-accent` | `#FFFFFF` | Chữ trắng 5.2:1 (xanh đủ đậm nên không cần chữ Mực nữa) |
| `accent-strong` | `#1D4ED8` | Link, chữ/icon nhấn: 6.7:1 trên trắng, 6.2:1 trên `surface-muted`; cũng là nền nút chính khi hover (chữ trắng 6.7:1) |
| `accent-soft` | `#EAF1FE` | Nền mục đang chọn: `ink` 15.6:1, `ink-soft` 7.7:1, `accent-strong` 5.9:1 |
| `code-accent` | `#60A5FA` | **Mới.** Con trỏ, viền focus, vùng chọn trong editor tối: 7.0:1 trên `code-bg`, 5.9:1 trên dòng đang đứng. `accent` chỉ 2.9:1 trên dòng đang đứng — quá tối |

Viền focus ngoài editor vẫn là 3px `ink`: 17.7:1 trên trắng, 3.4:1 trên nút xanh (≥ 3:1 cho thành phần không phải chữ).

Hover của nút chính đổi từ `accent/85` (nhạt đi, chữ trắng tụt còn ~4.2:1) sang `accent-strong` (đậm lên).

**Tách khỏi màu trạng thái — cả sắc độ lẫn độ sáng:**
- `attention` (mù tạt, ~45°): cách xanh dương (~221°) gần nửa vòng màu. Độ sáng tương phản thấp (1.2:1) nhưng một bên là nền vàng rất nhạt với chữ nâu đậm, một bên là mảng xanh đặc với chữ trắng.
- `success`: đậm thêm từ `#126B32` sang **`#0E5E2B`** (~142°, cách 79°). Độ sáng so với `accent` tăng từ 1.3:1 lên 1.5:1, và chữ "đạt" rõ hơn (7.9:1 trên trắng, 7.1:1 trên `success-surface`).
- `tokens.test.ts` chốt: khoảng cách sắc độ ≥ 30° giữa `accent` và `success`/`attention` (cả hai nền nhạt), `success` khác `accent` ≥ 1.5:1 về độ sáng.

**Màu cú pháp editor:** `code-function` xanh nhạt `#7CC6FF` chỉ cách màu nút 15° → đổi sang cyan **`#67E8F9`**. `code-number` cam `#FFC57A` → vàng nhạt **`#F3DFA2`**, vì luật "không màu cam ngoài trạng thái". Vẫn đạt AA trên mọi nền code (12.3 và 13.5:1 trên `code-bg`). Test chặn mọi màu cú pháp có màu sắc nằm trong 30° quanh `accent`.

**Thanh trình duyệt** (`theme-color`, `theme_color` của manifest) theo màu nhấn `#2563EB`: đó là giao diện, không phải logo.

## Hệ quả
- Tốt: trên màn bài tập chỉ còn một màu ấm, và nó luôn có nghĩa "cần chú ý". Nút chính và lỗi không còn chung nhóm màu.
- Tốt: chữ trên nút chính lên 5.2:1 (San hô + Mực là 4.9:1).
- Xấu: logo San hô và giao diện xanh dương là hai màu khác nhau trên cùng màn. Chấp nhận: logo nhỏ, nằm góc trái trên, quy tắc "San hô chỉ ở logo" giữ cho nó không bị đọc nhầm thành nút.
- Xấu: thêm token `code-accent` riêng cho editor.

## Phương án đã cân nhắc
- **Giữ San hô, chỉ đổi icon sang xám:** nút chính vẫn là mảng San hô lớn nhất màn, ngay cạnh khung lỗi — đúng chỗ trẻ nhầm.
- **Ngọc biển (ADR 0008):** gần xanh lá "đạt" (cả hai đều xanh) và cần chữ tối trên nút.
- **Tím:** trùng với nền `ai-surface` của gợi ý AI, mất tín hiệu "đây là AI".
