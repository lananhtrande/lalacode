# 0009 — Nhận diện thương hiệu: màu nhấn San hô, font Inter
Trạng thái: Chấp nhận
Ngày: 2026-11-05
Thay một phần: ADR 0008 (bảng màu "Ngọc biển" và font Be Vietnam Pro)
**Phần màu nhấn San hô được thay bởi ADR 0010** (xanh dương; San hô chỉ ở logo). Font Inter, logo, màu "cần chú ý" vẫn giữ.

## Bối cảnh
Người duy trì đã chốt logo lalakode (`docs/brand/README.md`): biểu tượng chữ "ơ" + con trỏ trên nền **San hô `#E8553A`**, logo chữ màu Mực `#18181B` dựng từ Inter ExtraBold, khẩu hiệu "Nền tảng học lập trình cho người Việt". Giao diện xanh ngọc + Be Vietnam Pro không còn khớp với logo.

ADR 0008 từng loại San hô vì **quá gần màu "cần chú ý"** (hổ phách `#A64B00`): trẻ có thể nhầm nút bấm chính với "có lỗi". Đổi sang San hô thì phải giải quyết điểm đó.

## Quyết định

**Giữ nguyên** mọi nguyên lý, tên token, component và quy tắc "chỉ giao diện sáng" của ADR 0008. Chỉ đổi giá trị màu và font.

**Màu nhấn San hô.** `accent` `#E8553A` lấy đúng màu logo. Chữ trắng trên San hô chỉ 3.6:1 nên chữ trên nút chính là Mực (`on-accent` `#18181B`, 4.9:1). Chữ/link màu nhấn dùng `accent-strong` `#B8381F` (5.8:1 trên trắng, 5.3:1 trên `surface-muted`). Nền nhạt `accent-soft` `#FDECE7`.

**Xám trung tính theo màu Mực.** `ink`, `ink-soft`, `surface-muted`, `line` và nền editor bỏ ánh xanh ngọc, chuyển sang xám trung tính (`ink` = Mực `#18181B`, `ink-soft` = chữ phụ của logo `#4A4A52`). Màu cú pháp `code-builtin` đổi từ xanh ngọc sang tím nhạt `#C4B5FD`; vùng chọn trong editor lấy từ `accent` bằng `color-mix`, không còn mã màu cố định.

**Tách "cần chú ý" khỏi màu nhấn.** `attention` đổi từ hổ phách sang **mù tạt đậm `#7A5C00`** trên nền **vàng nhạt `#FFF5CC`**:
- Sắc độ: San hô ~9°, mù tạt ~45° (hổ phách cũ ~27°, chỉ cách 18°). Nền thẻ: San hô nhạt ~14° và vàng nhạt ~48°.
- Độ sáng: nút chính là một mảng San hô sáng vừa, chữ tối; khối "cần chú ý" là nền vàng rất sáng với chữ/icon gần như nâu đen. Hai thứ không có cùng hình dạng thị giác.
- Vẫn luôn kèm icon tam giác và chữ (`ErrorPanel`, kết quả chấm, cảnh báo trong panel gợi ý). Icon cảnh báo quyền riêng tư trong panel gợi ý đổi từ `accent-strong` sang `attention` để màu đỏ-cam chỉ còn nghĩa "bấm vào đây".
- `tokens.test.ts` chốt khoảng cách sắc độ ≥ 30° giữa `attention`/`accent` và giữa hai nền nhạt của chúng.

Phương án bị loại: tím-đỏ cho lỗi (quá gần nền `ai-surface` tím nhạt của gợi ý AI); đỏ thật (mắng trẻ, trái luật 7 trong `CLAUDE.md`).

**Font Inter** (OFL), tự host ở `apps/web/public/fonts/inter/`, **variable** trục độ đậm 400–800 (một file cho mọi độ đậm), chia 3 bảng chữ theo `unicode-range` như cũ, `font-display: swap`. Cùng font với logo chữ, x-height cao nên rõ ở cỡ nhỏ trên điện thoại, dấu chồng tiếng Việt (Ổ, ầ, ừ) đầy đủ và không đụng dòng trên với line-height hiện có.
- Cắt từ bản phát hành chính thức Inter 4.1 bằng `docs/brand/build-inter.sh` (fontTools trong venv tạm, không thêm dependency). Bản trên Fontsource/Google Fonts đã bỏ mọi tính năng `cv`/`ss`.
- Bật `font-feature-settings: 'cv05'`: chữ `l` có đuôi, phân biệt được `l`, `I` và `1` — trẻ đọc tên biến trong đề bài dễ nhầm. **Không** bật `cv11` (chữ `a` một tầng): đã thử, chữ khác hẳn logo và sách giáo khoa in. **Không** bật `ss01` (số mở): không thấy lợi ích rõ cho chữ thân.
- Font code giữ font mono của hệ thống: SF Mono, Menlo (macOS/iOS) và Consolas (Windows) có đủ dấu tiếng Việt cho comment; máy nào font mono thiếu ký tự thì trình duyệt mượn ký tự đó từ font khác, không mất chữ. Chưa cần tự host JetBrains Mono.

### Bảng tương phản (WCAG 2.x)

| Chữ / nền | Tỉ lệ |
| --- | --- |
| `ink` trên `surface` | 17.7:1 |
| `ink-soft` trên `surface` | 8.8:1 |
| `on-accent` trên `accent` (chữ nút chính) | 4.9:1 |
| chữ trắng trên `accent` (không dùng) | 3.6:1 |
| `accent-strong` trên `surface` / `surface-muted` / `accent-soft` | 5.8 / 5.3 / 5.1:1 |
| `ink` trên `accent-soft` | 15.5:1 |
| `success` trên `surface` / `success-surface` | 6.6 / 5.9:1 |
| `attention` trên `surface` / `attention-surface` | 6.3 / 5.7:1 |
| `ink` trên `attention-surface` | 16.2:1 |
| Viền focus `ink` trên trắng / trên nút San hô | 17.7 / 4.9:1 |
| Viền focus và con trỏ `accent` trong editor, trên `code-bg` / `code-active` | 4.9 / 4.2:1 |

## Hệ quả
- Tốt: giao diện và logo cùng một bộ màu, một font.
- Tốt: font nhẹ hơn. Tổng `public/fonts/` 142 kB → 96 kB; một trang tiếng Việt thường tải latin + vietnamese: ~101 kB (6 file) → ~40 kB (2 file). Không nằm trong JS.
- Xấu: chữ trên nút chính chỉ còn 4.9:1 (Ngọc biển là 7.7:1) — vẫn đạt AA, và test chặn nếu tụt dưới 4.5.
- Xấu: Inter rộng hơn Be Vietnam Pro một chút; tiêu đề dài có thể xuống dòng sớm hơn ở 390 px (đã soát ảnh chụp, chấp nhận).
- Xấu: phải tự cắt font khi muốn nâng phiên bản Inter (có script).

## Phương án đã cân nhắc
- **Giữ Ngọc biển, chỉ thêm logo San hô:** hai màu nhấn trên một màn, phá nguyên lý "một màu nhấn".
- **Dùng `@fontsource-variable/inter`:** đỡ một bước tự cắt, nhưng mất `cv05`; file latin-ext nặng hơn (85 kB so với 57 kB) vì giữ trục 100–900.
- **Giữ Be Vietnam Pro:** vẫn tốt cho tiếng Việt, nhưng logo chữ là Inter; hai font sans gần giống nhau trên cùng một màn trông như lỗi.
