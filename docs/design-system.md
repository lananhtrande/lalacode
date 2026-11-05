# Design system lalakode

Lý do của từng lựa chọn: ADR 0008 (nguyên lý, token, component) và ADR 0009 (màu San hô, font Inter, logo — `docs/brand/README.md`). Xem trực tiếp mọi token và component: chạy `npm run dev` rồi mở `/dev/design` (chỉ có ở dev).

![Trang mẫu /dev/design](design/screenshots/s034-dev-design-1440.png)

## Nguyên tắc

1. **Một màu nhấn duy nhất** (`accent`) cho hành động chính và mục đang chọn. Mọi thứ khác là đen, xám, trắng: trẻ nhìn là biết phải bấm đâu. Mỗi màn chỉ nên có một nút `primary`.
2. **Màu không bao giờ là tín hiệu duy nhất.** Đúng/sai, xong/chưa xong luôn kèm icon và chữ.
3. **Mọi chữ đạt WCAG AA (≥ 4.5:1)** trên nền của nó. `src/tokens.test.ts` đọc thẳng `index.css` và chốt điều này; thêm cách phối chữ/nền mới thì thêm cặp vào test.
4. **Mọi thứ AI tạo ra nằm trên nền `ai-surface`** (`AiPanel`), để trẻ luôn biết đâu là gợi ý của trợ lý.
5. Chỉ có giao diện sáng. Editor và console là ngoại lệ, luôn tối.

## Màu

Khai báo một chỗ duy nhất: `@theme` trong `apps/web/src/index.css`. Dùng qua class Tailwind (`bg-surface`, `text-ink-soft`, `border-line`…). Không viết mã màu trong component.

| Token | Giá trị | Dùng cho | Tương phản |
| --- | --- | --- | --- |
| `ink` | `#18181B` (Mực) | Chữ chính, nút `dark`, mục nav đang chọn, viền focus | 17.7:1 trên `surface` |
| `ink-soft` | `#4A4A52` | Chữ phụ, mô tả, mục nav chưa chọn | 8.8:1 trên `surface` |
| `surface` | `#FFFFFF` | Thẻ, sidebar | — |
| `surface-muted` | `#F6F5F4` | Nền trang, khối phụ | — |
| `line` | `#E5E4E2` | Đường chia, viền thẻ | (không dùng cho chữ) |
| `accent` | `#E8553A` (San hô) | Nút `primary`, con trỏ, viền focus và vùng chọn trong editor | chữ trắng chỉ 3.6:1 — **không dùng** |
| `on-accent` | `#18181B` | Chữ trên `accent` | 4.9:1 |
| `accent-strong` | `#B8381F` | Link, icon nhấn, chữ màu nhấn trên nền sáng | 5.8:1 trên `surface`, 5.3:1 trên `surface-muted` |
| `accent-soft` | `#FDECE7` | Nền nhạt cho thứ đang được làm nổi (số thứ tự bài, chuỗi ngày học, huy hiệu đã nhận) | `ink` 15.5:1, `accent-strong` 5.1:1 |
| `ai-surface` | `#F1EEFF` | Nền khung gợi ý AI | `ink` 15.5:1 |
| `success` | `#126B32` | Chữ/icon "đạt", "xong" | 6.6:1 trên `surface` |
| `success-surface` | `#E7F6EC` | Nền thẻ đạt | `success` 5.9:1 |
| `attention` | `#7A5C00` (mù tạt) | Chữ/icon "chưa đạt", lỗi thân thiện, cảnh báo | 6.3:1 trên `surface` |
| `attention-surface` | `#FFF5CC` | Nền thẻ cần chú ý | `attention` 5.7:1, `ink` 16.2:1 |

`accent` **không đạt AA khi làm chữ trên nền trắng** (3.6:1). Chữ hay link mang màu nhấn thì dùng `accent-strong`.

**San hô ≠ "cần chú ý".** San hô chỉ có nghĩa "bấm vào đây / đang chọn". Mọi cảnh báo, lỗi, "chưa đạt" dùng `attention` (mù tạt, khác San hô ~36° sắc độ và sáng/tối hẳn), luôn kèm icon tam giác và chữ. `tokens.test.ts` chặn hai màu này xích lại gần nhau (< 30°).

## Chữ

Font **Inter** 4.1 (OFL), tự host ở `apps/web/public/fonts/inter/` kèm `OFL.txt`. Bản **variable** (độ đậm 400–800 trong một file), chia 3 file theo `unicode-range` (latin, latin-ext, vietnamese) nên trình duyệt chỉ tải phần cần — trang tiếng Việt thường ~40 kB. Cắt lại bằng `docs/brand/build-inter.sh`. Bật `font-feature-settings: 'cv05'` (chữ `l` có đuôi, phân biệt `l`/`I`/`1`). Độ đậm: 400 chữ thân, 600 nhãn và tiêu đề thẻ, 700 tiêu đề trang, 800 chỉ trong logo. Code dùng font mono của hệ thống.

| Class | Cỡ / dòng | Đậm | Dùng cho |
| --- | --- | --- | --- |
| `text-page-title` | 28 / 36 | 700 | Tiêu đề trang (`h1`); trang chủ phóng to hơn ở màn rộng |
| `text-section-title` | 22 / 30 | 600 | Tiêu đề mục (`h2`) |
| `text-card-title` | 18 / 26 | 600 | Tiêu đề thẻ |
| `text-body` | 16 / 24 | 400 | Chữ thân (mặc định của `body`) |
| `text-small` | 14 / 20 | 400 | Chữ phụ. **Không nhỏ hơn 14px** |
| `text-label` | 16 / 24 | 600 | Nhãn nút, mục nav |

## Nhận diện thương hiệu (S0-34)

Logo, favicon và icon màn hình chính nằm trong `apps/web/public/` (sinh từ `docs/brand/build-logo.mjs`, **không sửa tay**). Quy tắc dùng logo: `docs/brand/README.md`.

| | 1440 | 820 | 390 |
| --- | --- | --- | --- |
| Trang chủ, trước | ![](design/screenshots/s034-truoc-trang-chu-1440.png) | ![](design/screenshots/s034-truoc-trang-chu-820.png) | ![](design/screenshots/s034-truoc-trang-chu-390.png) |
| Trang chủ, sau | ![](design/screenshots/s034-sau-trang-chu-1440.png) | ![](design/screenshots/s034-sau-trang-chu-820.png) | ![](design/screenshots/s034-sau-trang-chu-390.png) |
| Bài tập có lỗi, trước | ![](design/screenshots/s034-truoc-bai-tap-loi-1440.png) | ![](design/screenshots/s034-truoc-bai-tap-loi-820.png) | ![](design/screenshots/s034-truoc-bai-tap-loi-390.png) |
| Bài tập có lỗi, sau | ![](design/screenshots/s034-sau-bai-tap-loi-1440.png) | ![](design/screenshots/s034-sau-bai-tap-loi-820.png) | ![](design/screenshots/s034-sau-bai-tap-loi-390.png) |

Ảnh bản đồ, giới thiệu và bài tập đã đúng: `design/screenshots/s034-{truoc,sau}-*`.

## Component (`apps/web/src/shared/ui/`)

| Component | Ghi chú |
| --- | --- |
| `Button` | `variant`: `primary` (hành động chính, ví dụ "Nộp bài"), `dark` ("Chạy thử"), `outline` ("Dừng"), `ghost` ("Làm lại từ đầu"). `size`: `md` (44px), `lg` (48px). `icon` đứng trước chữ. Mặc định `type="button"`. |
| `ButtonLink` | Link của router trông như nút. Dùng khi bấm là sang trang khác. |
| `buttonClasses()` | Class của nút, cho chỗ cần giữ thẻ riêng (ví dụ `<button>` có `ref`). |
| `IconButton` | Nút tròn 44×44 chỉ có icon; `label` bắt buộc (thành `aria-label`). |
| `Card` | Thẻ trắng bo 16px, bóng nhẹ, `as` = `div`/`section`/`article`/`li`. |
| `AiPanel` | Khung nền `ai-surface` cho nội dung do AI tạo. |

Mọi nút cao tối thiểu 44px (`min-h-tap`) và bo tròn hẳn. Viền focus: 3px `ink`, cách 2px — 17.7:1 trên nền trắng, 4.9:1 trên nút San hô. Trong editor tối, viền focus là 3px `accent` (4.9:1 trên `code-bg`).

## Áp vào từng màn

Quy tắc chung (S0-33), để màn mới viết ra trông giống màn cũ:

| Thứ | Class |
| --- | --- |
| `h1` của trang | `text-page-title` (trang chủ: phóng to ở màn rộng) |
| `h2` mục lớn | `text-section-title` |
| `h2` trong một khối, `h3` | `text-card-title` |
| Lời dẫn dưới tiêu đề, thân bài học | `text-card-title font-normal` (18px, dễ đọc đoạn dài) |
| Chữ phụ, chip trạng thái | `text-small` — **không dùng `text-xs`** |
| Khối có viền bên trong trang | `rounded-card border border-line p-4` (không bóng: đã nằm trong thẻ trắng của khung) |
| Khối code trong bài học | `bg-code-bg text-code-text`, cùng nền với editor |

Không viết `text-xl`, `text-2xl font-bold`… trực tiếp: chọn một trong sáu kiểu chữ ở trên.

| | 1440 | 820 | 390 |
| --- | --- | --- | --- |
| Trước (S0-31) | ![](design/screenshots/s031-ban-do-1440.png) | ![](design/screenshots/s031-ban-do-820.png) | — |
| Sau (S0-33) | ![](design/screenshots/s033-sau-ban-do-1440.png) | ![](design/screenshots/s033-sau-ban-do-820.png) | ![](design/screenshots/s033-sau-ban-do-390.png) |

## Khung trang

| Màn | Bố cục |
| --- | --- |
| ≥ 1024px | Sidebar trắng 240px: logo `lalakode-logo.svg` (cao 30px), 4 mục nav dạng viên thuốc (đang chọn: nền `ink`, chữ trắng), dưới cùng là "Mã tiến độ" và "Quyền riêng tư". Nội dung trong thẻ trắng trên nền `surface-muted`. |
| < 1024px | Thanh trên cùng (logo + nút menu). Nút menu mở ngăn kéo chứa chính phần nav; chọn mục, bấm lại nút hoặc Esc thì đóng. |

Chọn **ngăn kéo thay vì thanh nav ở đáy** vì đáy màn hình điện thoại để dành cho thanh nút Chạy/Nộp của màn bài tập (S0-32); hai thanh dính đáy sẽ chồng nhau.

Footer (`contentinfo`) nằm cuối cột nội dung ở mọi khổ màn hình, để chỉ có một footer trên trang.

| Bản đồ, 1440px | Bản đồ, 820px | Menu mở, 390px |
| --- | --- | --- |
| ![](design/screenshots/s031-ban-do-1440.png) | ![](design/screenshots/s031-ban-do-820.png) | ![](design/screenshots/s031-menu-390.png) |

## Editor và console tối

Theme CodeMirror **tự viết** trong `apps/web/src/shared/ui/code-theme.ts` (không dùng `@codemirror/theme-one-dark` hay `basicSetup`, ADR 0007). Màu là token `--color-code-*` trong `index.css`; `tokens.test.ts` đòi mọi màu chữ đạt AA trên nền, dòng đang đứng và gutter. Khối `@theme` là `static` để các biến này luôn có mặt dù không class nào dùng.

| Token | Màu | Dùng cho | Tương phản trên `code-bg` |
| --- | --- | --- | --- |
| `code-bg` | `#17171A` | Nền editor và console | — |
| `code-gutter` | `#1F1F23` | Cột số dòng, thanh tiêu đề "Code của em" / "Kết quả chạy" | — |
| `code-active` | `#26262B` | Dòng đang đứng | — |
| `code-text` | `#ECECEE` | Chữ thường, toán tử | 15.2:1 |
| `code-muted` | `#9A9AA3` | Số dòng, chữ chờ trong console | 6.4:1 |
| `code-keyword` | `#FF9AC1` | `import`, `for`, `if`, `def`, `in`… | 9.1:1 |
| `code-string` | `#A5E3A0` | Chuỗi | 12.0:1 |
| `code-number` | `#FFC57A` | Số, `True`/`False`/`None` | 11.5:1 |
| `code-comment` | `#A6A6AE` | Comment (trẻ đọc gợi ý trong code khởi đầu) | 7.4:1 |
| `code-function` | `#7CC6FF` | Gọi hàm, `turtle.forward` | 9.7:1 |
| `code-builtin` | `#C4B5FD` | `print`, `range`, `len`, `input`… (tô bằng `MatchDecorator` vì ngữ pháp Python không phân biệt) | 9.7:1 |

Con trỏ, viền focus 3px và vùng chọn (`color-mix` 30% `accent`) dùng `accent`; nền editor là xám trung tính, không ánh màu. Cỡ chữ code 16px, 15px dưới 640px, dòng cao 1.6. Đang chạy (chỉ đọc): chữ mờ đi, con trỏ ẩn.

## Màn bài tập

| Màn | Bố cục |
| --- | --- |
| ≥ 1024px | Đề bài trong thẻ trên cùng (dài quá 180 ký tự thì có nút thu gọn). Dưới là 2 cột ~55/45, cao đúng phần còn lại của màn hình, **mỗi cột tự cuộn**: trái là editor tối (tối thiểu ~16 dòng) và thanh nút ngay dưới; phải là lỗi → kết quả chạy → hình rùa → kết quả chấm → gợi ý. |
| < 1024px | Xếp dọc: đề bài → editor → kết quả → gợi ý. Thanh nút **dính đáy màn hình**; dưới 640px nút "Làm lại từ đầu" chỉ còn icon để thanh nằm một hàng. |

Chạy/nộp xong: màn rộng cuộn cột phải lên đầu, màn hẹp cuộn trang tới khu kết quả (`prefers-reduced-motion` thì nhảy thẳng, không trượt). Khu kết quả có `aria-live="polite"`. Hình rùa vuông, rộng theo cột (tối đa 560px), vẽ theo `devicePixelRatio`; toạ độ vẫn tính trên khung 320×320 mà bài học viết theo.

Nút: "Nộp bài" `primary`, "Chạy thử" `dark`, "Dừng" `outline`, "Làm lại từ đầu" `ghost`.

| | 1440 | 1180 (tablet ngang) | 820 (tablet dọc) | 390 |
| --- | --- | --- | --- | --- |
| Trước | ![](design/screenshots/s032-truoc-bai-tap-rua-1440.png) | — | ![](design/screenshots/s032-truoc-bai-tap-rua-820.png) | ![](design/screenshots/s032-truoc-bai-tap-rua-390.png) |
| Sau | ![](design/screenshots/s032-sau-bai-tap-rua-1440.png) | ![](design/screenshots/s032-sau-bai-tap-rua-1180.png) | ![](design/screenshots/s032-sau-bai-tap-rua-820.png) | ![](design/screenshots/s032-sau-bai-tap-rua-390.png) |
