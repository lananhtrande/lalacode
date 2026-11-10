# Prompt cho Claude Code — Làm mới giao diện: thanh menu trên cùng, font, cỡ chữ, màu, khoảng cách

> Cách dùng: làm **sau khi xong S0-40** của `docs/prompts/2026-11-10-ui-rebuild.md`. Mở Claude Code và gõ
> `Đọc docs/prompts/2026-11-10-visual-refresh.md và thực hiện.`
> Nhánh `feat/S0-41-visual-refresh`, một PR (có thể chia commit theo từng mục dưới đây).

## Bối cảnh

Người duy trì muốn LaLaKode có **cảm giác thị giác** giống một nền tảng học code cho người lớn mà họ đã khảo sát: font, cỡ chữ, màu, khoảng cách. Các số đo dưới đây đo từ trang đó (computed style, khổ ~1000–1440px) và đã được người duy trì duyệt trên canvas "LaLaKode – Bản mẫu giao diện học". **Chỉ lấy hệ số đo** (font, cỡ, màu, bo góc, khoảng cách). Không chép logo, hình minh hoạ, icon riêng, chữ hay nội dung của họ. Logo, nội dung và cách tổ chức là của LaLaKode.

Đọc trước: `CLAUDE.md`, `docs/design-system.md`, ADR 0008–0012, `apps/web/src/index.css`, `src/tokens.test.ts`, `app/RootLayout.tsx`, `shared/ui/*`, `features/courses/*`, `features/learn/*`, `features/exercise/*`.

**Đã làm sẵn trong cây làm việc (chưa commit)** — kiểm tra, sửa test cho khớp, rồi commit trước:
- `RootLayout.tsx`: sidebar trái đổi thành **thanh menu trắng dính trên cùng** (logo trái · menu chữ ở giữa, mục đang chọn chữ màu nhấn + vạch dưới · "Mã tiến độ" phải; < 1024px nút menu mở ngăn kéo thả xuống). Bài học/bài tập **giữ** khung học bài có mục lục tối bên trái (không đổi).
- `CatalogPage.tsx`, `CourseCard.tsx`: khung lọc một hàng, chữ nhỏ hơn.
- `docs/design-system.md` (bảng "Khung trang"), `e2e/smoke.spec.ts` (tên test).
Chạy `npm run check` + e2e; sửa chỗ hỏng. Commit: `feat(ui): top navigation bar replaces the sidebar`.

---

## 1. Font

- **Be Vietnam Pro** (OFL) thay Inter cho toàn bộ giao diện. Tự host trong `apps/web/public/fonts/be-vietnam-pro/` kèm `OFL.txt`, độ đậm 400/500/600/700, chia file theo `unicode-range` (latin, latin-ext, vietnamese), `font-display: swap`, preload file 400 vietnamese + latin. (Commit `d568cf8` đã xoá các file Be Vietnam Pro không dùng — xem lại trong lịch sử git để lấy lại nếu đúng bản.) Không còn bản variable: đo dung lượng font trang chủ, cập nhật ngân sách trong `docs/tech-stack.md`. Bỏ `cv05` của Inter.
- **JetBrains Mono** (OFL) cho editor, console, khối code, `code` inline. Tự host 400/500/700, có subset vietnamese. `font-variant-ligatures: none`.
- Logo giữ nguyên (chữ trong SVG đã outline).

## 2. Màu (`@theme` trong `index.css`)

| Token | Mới | Ghi chú |
| --- | --- | --- |
| `surface-muted` (nền trang) | `#F3F2EF` | xám ấm |
| `surface` | `#FFFFFF` | thẻ, thanh menu |
| `surface-sunken` (mới) | `#F7F7F6` | nền nhóm chip, ô tìm, select, ô đếm |
| `line` | `#E8E8E8` | viền thẻ, khung lọc; đường chia mảnh `#EFEFEF` (`line-soft`, mới) |
| `ink` | `#1B1B1B` | chữ chính |
| `ink-soft` | `#696969` | chữ phụ, mục menu chưa chọn — 5,5:1 trên trắng, ≥ 4,9:1 trên `#F3F2EF`/`#F7F7F6` (đo lại, thêm cặp vào test) |
| `accent` | `#2D65BC` | nút chính, mục đang chọn, vạch dưới menu; chữ trắng 5,68:1 |
| `accent-strong` | `#24539C` | link, chữ nhấn |
| `accent-soft` | `#EEF3FB` | nền nhãn cấp độ, nền thanh tiến độ, nền mục đang chọn ở ngăn kéo |
| `ink-surface` (mới) | `#24242A` | nền tối: mục lục học bài, nút "Chạy thử" |
| `code-bg` / `code-gutter` | `#2A2A30` / `#2E2E35` | editor, console; mọi màu cú pháp đo lại ≥ 4,5:1 |

Giữ nguyên `success`, `attention`, `ai-surface` và quy tắc "San hô chỉ ở logo", "màu không là tín hiệu duy nhất". Nhãn "Mới"/độ tuổi kiểu xanh lá nhạt: nền `#F1FAF4`, viền `#BFE6CF`, chữ `#1F6B3A`, chấm `#22A35A`.

## 3. Cỡ chữ

| Kiểu | Cỡ / dòng / đậm | Dùng cho |
| --- | --- | --- |
| `text-page-title` | 24 / 32 / 700 | `h1` (catalog: `h1` ẩn bằng `sr-only`, khung lọc đứng đầu trang) |
| `text-section-title` | 18 / 26 / 600 | `h2` mục lớn |
| `text-card-title` | 16 / 1.35 / 600, `letter-spacing: -0.01em` | tiêu đề thẻ |
| `text-body` | 16 / 24 / 400 | chữ thân, bài học (bài học đọc dài: 16 / 26) |
| `text-small` | 14 / 21 / 400 | mô tả thẻ (`line-clamp-2`), menu (500, đang chọn 600), chip (600) |
| `text-meta` (mới) | 12 / 16 / 500–600 | dòng "20 bài · khoảng 5 giờ", nhãn cấp độ, % tiến độ |

Quy tắc cũ "không nhỏ hơn 14px" đổi thành: **12px chỉ cho `text-meta`** (nhãn và số phụ, không cho câu cần đọc); câu văn tối thiểu 14px. Ghi vào ADR.

## 4. Khoảng cách, bo góc, bóng

- **Thanh menu:** cao 64px, nội dung tối đa 1280px, đệm ngang 24px; mục menu đệm ngang 16px, cao bằng thanh; vạch dưới 2px `accent`; viền dưới 1px `#ECECEC`.
- **Vùng nội dung:** tối đa 1600px, đệm 32px (16px dưới 640px), giữa các khối 28px.
- **Khung lọc:** bo 22px, viền 1px `line`, nền trắng 80%, đệm 12px, bóng `0 5px 24px rgba(15,23,42,.045)`. Hàng 1: nhóm chip (nền `surface-sunken`, bo 19px, đệm 6px, khe 4px; chip cao 40px, bo 11px, đệm 0 16px, 14/600; chip đang chọn nền trắng, chữ `accent`, bóng `0 0 0 1px line, 0 1px 5px rgba(15,23,42,.1)`) + ô tìm (cao 52px, bo 16px). Đường chia 1px. Hàng 2: select cấp độ (cao 40px, bo 12px) · nhóm trạng thái (chip cao 32px, bo 10px, 14/500) · ô "N khoá học" (bo 12px, 14/600) dồn phải.
- **Thẻ khoá học:** bo 20px, viền 1px `#EBEBEB`, **không bóng**. Ảnh lồng trong: đệm 12px 12px 0, ảnh cao 136px, bo 13px, viền 1px màu theo chủ đề. Thân thẻ đệm 14px 16px 16px; nhãn cao 22px, bo 6px, đệm 0 8px, 12/600; tiêu đề cách nhãn 8px; mô tả cách 8px; dòng meta cách 12px; chân thẻ `mt-auto pt-3`. Lưới `repeat(auto-fill, minmax(300px, 1fr))`, khe 20px.
- **Nút:** bo **8px** (không còn viên thuốc). Cỡ `md` cao 40px, đệm 0 16px, 14/600; cỡ `sm` (trong thẻ) cao 36px, đệm 0 14px, 13/600. Nút chính nền `accent` chữ trắng; nút phụ nền `accent` 5% chữ `accent`; nút tối nền `ink-surface`. Nút chỉ có icon vẫn 40×40.
- **Thẻ, khối khác:** `rounded-card` = 20px; khối lồng trong thẻ bo 12–14px.
- **Vùng bấm:** nút/chip tối thiểu 40px (chip trạng thái 32px nằm trong nhóm cao 40px — vẫn trên ngưỡng 24px của WCAG 2.2 AA). Ghi vào ADR rằng đã hạ từ 44px để khớp hệ mới.

## 5. Áp vào màn

Catalog, trang khoá, trang chủ, huy hiệu, giới thiệu, quyền riêng tư, mã tiến độ, khung học bài, bài thực hành, kho luyện tập. Bài thực hành: tab "Kết quả"/"Kiểm tra" 15/600, gạch dưới 3px `accent`. Mục lục học bài giữ cấu trúc, đổi sang `ink-surface` và cỡ chữ mới (mục 15px, nhãn chương 12/600 in hoa).

## Kiểm tra

- `tokens.test.ts`: mọi cặp chữ/nền mới đạt AA (chữ thường ≥ 4,5:1), kể cả `ink-soft` trên `surface-sunken`, chữ trắng trên `accent` và `ink-surface`, màu cú pháp trên `code-bg`/dòng đang đứng.
- `/dev/design` hiện token, kiểu chữ và nút mới.
- Ảnh trước/sau ở 1440/1024/390 cho catalog, trang khoá, bài học, bài tập (đang chạy, có lỗi, đã đúng), luyện tập → `docs/design/screenshots/s041-*`.
- ADR `0013-visual-refresh.md`: thay phần font của 0009, giá trị màu của 0010, quy tắc cỡ chữ tối thiểu và vùng bấm 44px của 0008; ghi rõ chỉ lấy hệ số đo, không lấy tài sản thiết kế của trang tham khảo.
- `npm run check`, `npm run test:e2e` xanh; cập nhật `docs/design-system.md`, `docs/roadmap-stage0.md` (S0-41).
