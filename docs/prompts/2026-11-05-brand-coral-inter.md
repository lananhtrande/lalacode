# Prompt cho Claude Code — Gắn logo mới, đổi màu nhấn sang San hô, đổi font sang Inter

> Cách dùng: mở Claude Code trong repo và gõ
> `Đọc docs/prompts/2026-11-05-brand-coral-inter.md và thực hiện.`

## Bối cảnh

Người duy trì đã chốt nhận diện thương hiệu mới (xem `docs/brand/README.md`, file đã có sẵn trong `apps/web/public/brand/` và `apps/web/public/favicon*`):
- **Logo:** biểu tượng chữ “ơ” + con trỏ trên nền **San hô `#E8553A`**, logo chữ `lalakode` màu Mực `#18181B`.
- **Khẩu hiệu:** “Nền tảng học lập trình cho người Việt” (đã sửa `vi.footer.madeFor` trong `vi.ts`, chưa commit — đưa vào commit đầu).
- **Font giao diện:** đổi từ Be Vietnam Pro sang **Inter**.

Điều này **thay một phần ADR 0008** (bảng màu “Ngọc biển”, font Be Vietnam Pro). ADR 0008 từng loại San hô vì quá gần màu “cần chú ý” — phải giải quyết điểm đó (mục 2).

Đọc trước: `CLAUDE.md`, `docs/decisions/0008-visual-design-system.md`, `docs/design-system.md`, `docs/brand/README.md`, `apps/web/src/index.css`, `apps/web/src/app/RootLayout.tsx`, `apps/web/index.html`, trang `/dev/design`.

Một nhánh, một PR: `feat/S0-34-brand-coral-inter`. Thêm S0-34 vào roadmap.

## 1. Gắn logo
- `RootLayout`: thay icon `Turtle` + chữ `vi.app.name` bằng `<img src="/brand/lalakode-logo.svg" alt="lalakode">` (cao ~28–32 px, `width`/`height` khai báo sẵn để không nhảy layout). Link vẫn về `/`, vẫn ≥ 44 px chiều cao vùng bấm.
- Nếu có chỗ đặt logo trên nền tối thì dùng `lalakode-logo-dark.svg`. Trang giới thiệu (`/gioi-thieu`) có thể dùng `lalakode-logo-tagline.svg` ở đầu trang.
- `index.html`: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `<link rel="icon" href="/favicon-32.png" sizes="32x32">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `theme-color` = `#E8553A`. Thêm `manifest.webmanifest` tối thiểu (name, short_name, icons 192/512, theme/background color) — không service worker.
- Kiểm tra CSP và cấu hình cache của CloudFront (`infra/`) vẫn phục vụ được `/brand/*`, `/favicon*`, `/manifest.webmanifest`; nếu cần đổi Terraform thì chỉ `plan`, không `apply`.
- Không sửa các file trong `apps/web/public/brand/` (chúng sinh từ `docs/brand/build-logo.mjs`).

## 2. Màu nhấn San hô
- Token: `accent` = `#E8553A`. Đo lại tương phản và đặt:
  - `on-accent` (chữ trên nút chính): **`#18181B`** — chữ trắng trên San hô chỉ ~3,6:1, không đạt AA cho chữ 16 px.
  - `accent-strong` (link, chữ nhấn trên nền trắng): một sắc San hô đậm đạt ≥ 4,5:1 trên `surface` và `surface-muted` (khoảng `#B8381F` — tự đo).
  - `accent-soft`: nền San hô rất nhạt cho mục đang chọn / thẻ nổi bật, chữ trên nó vẫn đạt AA.
  - Viền focus: phải thấy rõ trên nền trắng **và** trên editor tối.
- **Tách khỏi màu “cần chú ý”:** hiện `attention` là hổ phách `#A64B00` — quá gần San hô. Đổi `attention` sang hướng khác về **độ sáng và sắc độ** (ví dụ vàng đậm / mù tạt, hoặc dùng tím-đỏ cho lỗi), luôn kèm icon + chữ như quy tắc cũ; kiểm tra lại `ErrorPanel`, kết quả chấm, panel gợi ý. Không để trẻ nhầm “nút bấm chính” với “có lỗi”.
- Xem lại các màu dùng xanh ngọc cố định ngoài token (grep `2dd4bf`, `0f766e`, `teal`, `ngoc`) và màu cú pháp `--color-code-builtin` (đang là xanh ngọc) — đổi cho hợp bảng màu mới, vẫn đạt AA trên nền code.
- Cập nhật trang `/dev/design` hiển thị bảng màu mới.

## 3. Font Inter
- Tự host Inter (OFL) trong `apps/web/public/fonts/inter/` — ưu tiên **variable font** woff2 chia theo `unicode-range` (latin, latin-ext, vietnamese) giống cách Be Vietnam Pro đang làm; kèm file giấy phép. Không dùng Google Fonts/CDN.
- `--font-sans: 'Inter', system-ui, …`. Độ đậm dùng: 400 (thân), 600 (nhãn, tiêu đề thẻ), 700/800 (tiêu đề trang). Bật `font-feature-settings: 'cv11', 'ss01'` nếu giúp chữ dễ đọc hơn cho trẻ (chữ `a`, `l` dễ phân biệt) — tự thử và chọn, ghi lý do.
- Inter có x-height cao hơn Be Vietnam Pro: kiểm tra lại line-height, chiều cao nút, tiêu đề xuống dòng trên điện thoại.
- Gỡ font Be Vietnam Pro khỏi `public/fonts/` và mọi `@font-face` cũ (cần quyền xoá file — nếu bị từ chối thì báo người duy trì).
- Kiểm tra dấu: chụp màn hình chuỗi `Hoàn thành! Ổ bánh mì, ước mơ, Đội bóng, Nền tảng học lập trình cho người Việt` ở 16 px và 32 px.
- Font code giữ như hiện tại, trừ khi font mono đang dùng thiếu dấu tiếng Việt trong comment — nếu thiếu, tự host **JetBrains Mono** (OFL).

## 4. Tài liệu
- ADR `0009-brand-coral-inter.md`: thay phần nào của 0008, vì sao (logo đã chốt), cách tách màu “cần chú ý”, bảng tương phản.
- Cập nhật `docs/design-system.md` (token, font, bảng tương phản), `docs/tech-stack.md` (font), ghi chú trong ADR 0008 “phần màu và font được thay bởi 0009”.

## 5. Kiểm tra
1. `npm run check`, `npm run test:e2e` (Chromium + WebKit) xanh. Test tương phản token (nếu đã có) cập nhật theo màu mới và vẫn pass.
2. Ảnh chụp trước/sau (1440, 820, 390) cho trang chủ, bản đồ, bài tập (có lỗi + đã đúng), giới thiệu → `docs/design/screenshots/` và mô tả PR.
3. Font không làm tăng JS bundle; ghi tổng dung lượng font mới so với cũ.
4. Gọi agent `privacy-reviewer` (font, manifest, không request ngoài).
5. Dừng lại cho người duy trì xem ảnh chụp trước khi merge.
