# Design system lalakode

Lý do của từng lựa chọn: ADR 0008 (nguyên lý, token, component), ADR 0009 (font Inter, logo — `docs/brand/README.md`) và ADR 0010 (màu nhấn xanh dương; **San hô chỉ ở logo**). Xem trực tiếp mọi token và component: chạy `npm run dev` rồi mở `/dev/design` (chỉ có ở dev).

![Trang mẫu /dev/design](design/screenshots/s035-dev-design-1440.png)

## Nguyên tắc

1. **Một màu nhấn duy nhất** (`accent`) cho hành động chính và mục đang chọn. Mọi thứ khác là đen, xám, trắng: trẻ nhìn là biết phải bấm đâu. Mỗi màn chỉ nên có một nút `primary`.
2. **Màu không bao giờ là tín hiệu duy nhất.** Đúng/sai, xong/chưa xong luôn kèm icon và chữ.
3. **Mọi chữ đạt WCAG AA (≥ 4.5:1)** trên nền của nó. `src/tokens.test.ts` đọc thẳng `index.css` và chốt điều này; thêm cách phối chữ/nền mới thì thêm cặp vào test.
4. **Mọi thứ AI tạo ra nằm trên nền `ai-surface`** (`AiPanel`), để trẻ luôn biết đâu là gợi ý của trợ lý.
5. Chỉ có giao diện sáng. Editor, console và sidebar mục lục của trình học bài (ADR 0011) là ngoại lệ, luôn tối.

## Màu

Khai báo một chỗ duy nhất: `@theme` trong `apps/web/src/index.css`. Dùng qua class Tailwind (`bg-surface`, `text-ink-soft`, `border-line`…). Không viết mã màu trong component.

| Token | Giá trị | Dùng cho | Tương phản |
| --- | --- | --- | --- |
| `ink` | `#18181B` (Mực) | Chữ chính, nút `dark`, mục nav đang chọn, viền focus | 17.7:1 trên `surface` |
| `ink-soft` | `#4A4A52` | Chữ phụ, mô tả, mục nav chưa chọn | 8.8:1 trên `surface` |
| `surface` | `#FFFFFF` | Thẻ, sidebar | — |
| `surface-muted` | `#F6F5F4` | Nền trang, khối phụ | — |
| `line` | `#E5E4E2` | Đường chia, viền thẻ | (không dùng cho chữ) |
| `accent` | `#2563EB` (xanh dương) | Nút `primary`, mục đang chọn | — |
| `on-accent` | `#FFFFFF` | Chữ trên `accent` (và trên `accent-strong` khi hover) | 5.2:1 / 6.7:1 |
| `accent-strong` | `#1D4ED8` | Link, icon nhấn, chữ màu nhấn trên nền sáng; nền nút chính khi hover | 6.7:1 trên `surface`, 6.2:1 trên `surface-muted` |
| `accent-soft` | `#EAF1FE` | Nền nhạt cho thứ đang được làm nổi (số thứ tự bài, chuỗi ngày học, huy hiệu đã nhận) | `ink` 15.6:1, `accent-strong` 5.9:1 |
| `ai-surface` | `#F1EEFF` | Nền khung gợi ý AI | `ink` 15.5:1 |
| `success` | `#0E5E2B` | Chữ/icon "đạt", "xong" | 7.9:1 trên `surface` |
| `success-surface` | `#E7F6EC` | Nền thẻ đạt | `success` 7.1:1 |
| `attention` | `#7A5C00` (mù tạt) | Chữ/icon "chưa đạt", lỗi thân thiện, cảnh báo | 6.3:1 trên `surface` |
| `attention-surface` | `#FFF5CC` | Nền thẻ cần chú ý | `attention` 5.7:1, `ink` 16.2:1 |

Chữ hay link mang màu nhấn dùng `accent-strong`, không dùng `accent` (chỉ 5.2:1 trên trắng, sát ngưỡng trên nền xám nhạt).

**San hô chỉ ở logo.** `#E8553A` chỉ có trong file logo/favicon. Không nút, link, trạng thái, icon hay nền nào dùng San hô hoặc một sắc đỏ/cam. Màu ấm duy nhất của giao diện là `attention` (mù tạt) cho cảnh báo, lỗi, "chưa đạt" — luôn kèm icon tam giác và chữ. Xanh dương chỉ có nghĩa "bấm vào đây / đang chọn". `tokens.test.ts` chặn `accent` xích lại gần `success`/`attention` (< 30° sắc độ) và chặn màu cú pháp nào giống màu nút.

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

Mọi nút cao tối thiểu 44px (`min-h-tap`) và bo tròn hẳn. Viền focus: 3px `ink`, cách 2px — 17.7:1 trên nền trắng, 3.4:1 trên nút xanh dương. Trong editor tối, viền focus là 3px `code-accent` (7.0:1 trên `code-bg`).

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
| ≥ 1024px | Sidebar trắng 240px: logo `lalakode-logo.svg` (cao 30px), 5 mục nav dạng viên thuốc (Trang chủ · Khoá học · Luyện tập · Huy hiệu · Giới thiệu) (đang chọn: nền `ink`, chữ trắng), dưới cùng là "Mã tiến độ" và "Quyền riêng tư". Nội dung trong thẻ trắng trên nền `surface-muted`. |
| < 1024px | Thanh trên cùng (logo + nút menu). Nút menu mở ngăn kéo chứa chính phần nav; chọn mục, bấm lại nút hoặc Esc thì đóng. |

Chọn **ngăn kéo thay vì thanh nav ở đáy** vì đáy màn hình điện thoại để dành cho thanh nút Chạy/Nộp của màn bài tập (S0-32); hai thanh dính đáy sẽ chồng nhau.

Footer (`contentinfo`) nằm cuối cột nội dung ở mọi khổ màn hình, để chỉ có một footer trên trang.

| Bản đồ, 1440px | Bản đồ, 820px | Menu mở, 390px |
| --- | --- | --- |
| ![](design/screenshots/s031-ban-do-1440.png) | ![](design/screenshots/s031-ban-do-820.png) | ![](design/screenshots/s031-menu-390.png) |

## Catalog và trang khoá (S0-37)

Lý do và những thứ cố ý không làm: ADR 0011. Logic (tiến độ khoá, bộ lọc, "tiếp tục bài N") là hàm thuần trong `apps/web/src/content/catalog.ts`.

| Màn | Bố cục |
| --- | --- |
| `/khoa-hoc` | Khung lọc trắng bo góc: chip **Trạng thái** (Tất cả · Đang học · Đã xong · Chưa học) và **Cấp độ** (`<button aria-pressed>`, đang chọn: nền `ink`), ô tìm theo tên (bỏ dấu: gõ "khoi dong" vẫn ra), dòng "N khoá học" (`aria-live`). Bộ lọc nằm trên URL. Lưới thẻ 1 / 2 (≥ 640) / 3 (≥ 1024) / 4 (≥ 1440) cột trên nền `surface-muted`. Chưa đủ khoá thì có ô "Khoá học mới · Sắp có" nét đứt, không bấm được, không ghi tên khoá. |
| Thẻ khoá | Hình minh hoạ 16:9 (`public/illustrations/`, tự vẽ, `alt=""` vì tên khoá ngay dưới) → `LevelBadge` → tiêu đề → mô tả cắt 2 dòng (`line-clamp-2`, dòng cao 24px để dấu chồng không bị cắt) → "20 bài · khoảng 5 giờ" → `ProgressBar` khi đã bắt đầu → nút. |
| `/khoa-hoc/:courseId` | Đầu trang: cấp độ, `h1`, mô tả, "x/20 bài đã xong", thanh tiến độ, nút chính; hình minh hoạ bên phải (≥ 768). Chuỗi ngày học. Mục lục theo chương dạng `<details>`, mở sẵn chương chứa bài đang học; mỗi dòng bài: số thứ tự, tên, trạng thái (icon + chữ "Đã xong" / "Đang học" / "Chưa học"), số phút, "2/4 bài tập". Chip "Bản nháp" chỉ hiện khi chạy dev. |

| Trạng thái khoá | Nút trên thẻ | Nút chính trên trang khoá |
| --- | --- | --- |
| Chưa học | "Khám phá →" `outline`, tới trang khoá | "Bắt đầu →" `primary`, tới bài 1 |
| Đang học | "Tiếp tục bài N →" `primary`, tới bài đầu tiên chưa xong | như thẻ |
| Đã xong | "Ôn lại →" `outline`, tới trang khoá | "Ôn lại →" `outline`, tới bài 1 |

`LevelBadge`: ba cột cao dần, tô đặc 1/2/3 cột cho Mới bắt đầu/Cơ bản/Nâng cao, kèm chữ — không phân biệt bằng màu. `ProgressBar`: `role="progressbar"` kèm số % bằng chữ.

`/ban-do` (bản đồ nhiệm vụ cũ) chuyển hướng `replace` sang `/khoa-hoc/py-khoi-dong`. Trang chủ: đã học thì nút chính là "Tiếp tục bài N →", chưa thì "Bắt đầu học" tới `/khoa-hoc`. Hết khoá, nút đi tiếp (S0-36) là "Về trang khoá học".

| | 1440 | 820 | 390 |
| --- | --- | --- | --- |
| Bản đồ, trước | ![](design/screenshots/s037-truoc-ban-do-1440.png) | ![](design/screenshots/s037-truoc-ban-do-820.png) | ![](design/screenshots/s037-truoc-ban-do-390.png) |
| Catalog, sau | ![](design/screenshots/s037-sau-khoa-hoc-1440.png) | ![](design/screenshots/s037-sau-khoa-hoc-820.png) | ![](design/screenshots/s037-sau-khoa-hoc-390.png) |
| Trang khoá, sau | ![](design/screenshots/s037-sau-trang-khoa-1440.png) | ![](design/screenshots/s037-sau-trang-khoa-820.png) | ![](design/screenshots/s037-sau-trang-khoa-390.png) |

Trang chủ trước/sau: `design/screenshots/s037-{truoc,sau}-trang-chu-*`.

## Trình học bài (S0-38)

`/bai-hoc/:id` và `/bai-tap/:id` không dùng khung chung (sidebar menu, chân trang) mà dùng **khung học bài** `features/learn/LearnLayout.tsx` (route `handle: { layout: 'learn' }`, ADR 0011).

| Phần | Bố cục |
| --- | --- |
| Sidebar mục lục (≥ 1024px) | Rộng 280px, nền `learn-bg`. Trên cùng: logo `lalakode-logo-dark.svg` (link về trang khoá), nút thu gọn, tên khoá, "7/20 bài · 35%" + `ProgressBar tone="dark"`. Dưới: chương dạng `<details>` (mở sẵn chương đang học), trong mỗi bài một dòng "Học bài" (icon sách, hoặc icon phim khi có video) và một dòng cho mỗi bài tập. Trạng thái: icon ✓ `learn-success` / vòng tròn, kèm chữ ẩn "Đã xong" / "Chưa xong". Mục đang mở: nền `learn-current`, vạch trái `learn-accent`, `aria-current="page"`, tự cuộn vào tầm nhìn. |
| Thu gọn | Dải icon 64px: nút mở rộng, biểu tượng logo, số %. Nhớ trong `localStorage` (`lalakode.learn-sidebar.bai-hoc` / `.bai-tap`), riêng cho từng màn. **Màn bài tập mặc định thu gọn** để editor rộng. |
| < 1024px | Nút "Mục lục" trên topbar mở ngăn kéo (`role="dialog"`); Esc, bấm ra ngoài hoặc chọn một mục thì đóng, focus trả về nút. |
| Topbar | Cao 56px, dính trên cùng. Breadcrumb `<nav aria-label="Vị trí">`: Khoá học › Python khởi động › Bài 3 · Rùa vẽ hình (dưới 768px chỉ còn mục cuối). Bộ đếm "Bài 3/20", màn bài tập thêm "Bài tập 2/4". Bên phải là chỗ cho màn con đặt nội dung (`TopbarSlot`): màn bài tập đặt "Python sẵn sàng". |
| Bài học | Thẻ trắng rộng tối đa 720px, căn giữa: nhãn chương in hoa nhỏ → `h1` → thời lượng, khái niệm → video (chỉ khi bài có video) → "Nội dung bài" → thân bài → bài tập → bài trước/tiếp. |
| "Nội dung bài" | Tự sinh từ các tiêu đề `#`/`##` của `lesson.md` (`content/outline.ts`): `id` bỏ dấu, ổn định (`#vong-lap-long-nhau`). Ở ≥ 1280px dính bên phải và tô mục đang đọc (`aria-current="location"`); dưới 1280px nằm đầu bài. Bài có dưới hai mục thì không hiện — **20 bài hiện tại đều chỉ có một tiêu đề**, nên khối này chưa xuất hiện cho tới khi bài được chia mục. |

| Token | Màu | Dùng cho | Tương phản |
| --- | --- | --- | --- |
| `learn-bg` | `#18181B` | Nền sidebar | — |
| `learn-current` | `#1E2B45` | Mục đang mở | `learn-text` 12.0:1, `learn-muted` 5.5:1 |
| `learn-hover` | `#26262B` | Di chuột | — |
| `learn-line` | `#2E2E34` | Đường chia | (không dùng cho chữ) |
| `learn-text` | `#ECECEE` | Chữ chính | 15.0:1 trên `learn-bg` |
| `learn-muted` | `#A1A1AA` | Chữ phụ, icon, số đếm | 6.9:1 trên `learn-bg` |
| `learn-accent` | `#60A5FA` | Vạch mục đang mở, thanh tiến độ, viền focus | 7.0:1 trên `learn-bg`, 5.6:1 trên `learn-current`, 4.1:1 trên rãnh `learn-track` |
| `learn-success` | `#4ADE80` | Icon "đã xong" | 10.2:1 trên `learn-bg` |

| | 1440 | 820 | 390 |
| --- | --- | --- | --- |
| Bài học, trước | ![](design/screenshots/s038-truoc-bai-hoc-1440.png) | ![](design/screenshots/s038-truoc-bai-hoc-820.png) | ![](design/screenshots/s038-truoc-bai-hoc-390.png) |
| Bài học, sau | ![](design/screenshots/s038-sau-bai-hoc-1440.png) | ![](design/screenshots/s038-sau-bai-hoc-820.png) | ![](design/screenshots/s038-sau-bai-hoc-390.png) |
| Bài tập, trước | ![](design/screenshots/s038-truoc-bai-tap-1440.png) | ![](design/screenshots/s038-truoc-bai-tap-820.png) | ![](design/screenshots/s038-truoc-bai-tap-390.png) |
| Bài tập, sau | ![](design/screenshots/s038-sau-bai-tap-1440.png) | ![](design/screenshots/s038-sau-bai-tap-820.png) | ![](design/screenshots/s038-sau-bai-tap-390.png) |

Ngăn kéo mục lục, 390px: ![](design/screenshots/s038-sau-muc-luc-390.png)

## Kho luyện tập (S0-40)

`/luyen-tap`: mọi bài tập của mọi khoá, đọc từ `index.json` (đã có tên, độ khó, chủ đề — không tải từng bài học). Logic là hàm thuần trong `apps/web/src/content/practice.ts`.

| Phần | Bố cục |
| --- | --- |
| Bộ bài | Băng cuộn ngang trên cùng, mỗi chương một thẻ ("Làm quen với Python" + thanh tiến độ "3/19"), `scroll-snap`, hai nút ‹ › để cuộn bằng chuột/bàn phím. Bấm một thẻ (`aria-pressed`) để lọc theo chương, bấm lại để bỏ. |
| Bộ lọc | Cột trái 240px ở ≥ 1024px; dưới đó là nút "Bộ lọc" mở khung ngay trên danh sách. Độ khó (Dễ · Vừa · Khó · Thử thách) và chủ đề (lấy từ `tags` của bài học) là ô đánh dấu **kèm số bài** nếu chọn thêm; trạng thái (Tất cả · Chưa làm · Đã xong) và "Chỉ bài để dành". Trong một nhóm là "hoặc", giữa các nhóm là "và". Mọi bộ lọc nằm trên URL (`?do=de&chu-de=rùa&trang-thai=chua-lam&bo=…&de-danh=1`). |
| Danh sách | Bảng ở ≥ 768px (Trạng thái · Bài tập · Thuộc bài · Độ khó · Để dành), thẻ ở màn hẹp. Trạng thái là icon ✓/vòng tròn kèm chữ ẩn. **Không** có tỉ lệ đúng, lượt nộp hay sao đánh giá (ADR 0011). Nút "Bài ngẫu nhiên" (`dark`) mở một bài **chưa xong** trong danh sách đang lọc; xong hết thì khen thay vì mở bài. |
| Cột phải (≥ 1280px) | "Tiếp tục" (bài chưa xong đầu tiên theo thứ tự khoá, nút `primary`); "Thử thách hôm nay" (băm ngày địa phương `YYYY-MM-DD`, chọn trong nhóm khó nhất đang có — mọi máy cùng ngày thấy cùng bài, không gọi mạng); lịch ngày học của tháng (bắt đầu từ thứ Hai; ngày có học: nền `accent-soft`, icon lửa và chữ ẩn "có học"; hôm nay có viền). |

"Để dành" (icon dấu trang, `aria-pressed`) lưu trong hồ sơ trên máy (`profile.saved`, IndexedDB), đi theo mã tiến độ như huy hiệu. Trạng thái rỗng: lọc không ra → "Không có bài tập nào khớp. Thử bỏ bớt bộ lọc nhé." + "Xoá bộ lọc"; chưa làm bài nào → "Chọn một bài để bắt đầu nhé!".

Trước S0-40 trang này là khung "Đang xây". Ảnh dưới chụp cùng lúc với thanh menu trên cùng đang làm dở cho S0-41.

| 1440 | 820 | 390 | 390, mở bộ lọc |
| --- | --- | --- | --- |
| ![](design/screenshots/s040-sau-luyen-tap-1440.png) | ![](design/screenshots/s040-sau-luyen-tap-820.png) | ![](design/screenshots/s040-sau-luyen-tap-390.png) | ![](design/screenshots/s040-sau-bo-loc-390.png) |

## Editor và console tối

Theme CodeMirror **tự viết** trong `apps/web/src/shared/ui/code-theme.ts` (không dùng `@codemirror/theme-one-dark` hay `basicSetup`, ADR 0007). Màu là token `--color-code-*` trong `index.css`; `tokens.test.ts` đòi mọi màu chữ đạt AA trên nền, dòng đang đứng và gutter. Khối `@theme` là `static` để các biến này luôn có mặt dù không class nào dùng.

| Token | Màu | Dùng cho | Tương phản trên `code-bg` |
| --- | --- | --- | --- |
| `code-bg` | `#17171A` | Nền editor và console | — |
| `code-gutter` | `#1F1F23` | Cột số dòng, thanh tiêu đề "Code của em" / "Kết quả chạy" | — |
| `code-active` | `#26262B` | Dòng đang đứng | — |
| `code-text` | `#ECECEE` | Chữ thường, toán tử | 15.2:1 |
| `code-accent` | `#60A5FA` | Con trỏ, viền focus, vùng chọn | 7.0:1 |
| `code-muted` | `#9A9AA3` | Số dòng, chữ chờ trong console | 6.4:1 |
| `code-keyword` | `#FF9AC1` | `import`, `for`, `if`, `def`, `in`… | 9.1:1 |
| `code-string` | `#A5E3A0` | Chuỗi | 12.0:1 |
| `code-number` | `#F3DFA2` | Số, `True`/`False`/`None` | 13.5:1 |
| `code-comment` | `#A6A6AE` | Comment (trẻ đọc gợi ý trong code khởi đầu) | 7.4:1 |
| `code-function` | `#67E8F9` | Gọi hàm, `turtle.forward` | 12.3:1 |
| `code-builtin` | `#C4B5FD` | `print`, `range`, `len`, `input`… (tô bằng `MatchDecorator` vì ngữ pháp Python không phân biệt) | 9.7:1 |

Con trỏ, viền focus 3px và vùng chọn (`color-mix` 30%) dùng `code-accent` `#60A5FA` (7.0:1 trên `code-bg`, 5.9:1 trên dòng đang đứng) — `accent` quá tối trên nền code; nền editor là xám trung tính, không ánh màu. Cỡ chữ code 16px, 15px dưới 640px, dòng cao 1.6. Đang chạy (chỉ đọc): chữ mờ đi, con trỏ ẩn.

## Màn bài tập (bài thực hành chia đôi, S0-39)

| Màn | Bố cục |
| --- | --- |
| ≥ 1024px | Hai cột ~40/60, cao đúng phần dưới topbar, **mỗi phần tự cuộn**. **Trái:** thẻ trắng — độ khó (`DifficultyBadge`: số cột tô + chữ Dễ · Vừa · Khó · Thử thách, không phân biệt bằng màu) → `h1` → đề → "Yêu cầu" (gạch đầu dòng, code inline nền nhạt, không tô đỏ) → "Ví dụ" (khối nền code tối: Đầu vào / Kết quả mong đợi / ghi chú) → gợi ý AI. **Phải trên:** editor tối, header "Python" + trạng thái tải + A−/A+ + nút icon "Làm lại từ đầu"; ngay dưới là thanh Chạy thử / Nộp bài. **Phải dưới:** thanh kéo (`role="separator"`, mũi tên lên/xuống ±32px, Home/End) rồi panel hai tab "Kết quả" (console, hình rùa, lỗi) và "Kiểm tra (N)" (kết quả từng test). Panel thu gọn được ("Thu gọn"). Dưới cùng là bài trước/tiếp. |
| < 1024px | Ba tab dính đầu (dưới topbar): **Đề · Code · Kết quả**, mở ở tab "Đề". Thanh Chạy thử / Nộp bài dính đáy, tab nào cũng bấm được. Bài trước/tiếp nằm dưới tab đang mở. |

- Chạy thử → sang tab "Kết quả"; Nộp bài → sang "Kiểm tra" (Python lỗi thì về "Kết quả" để thấy `ErrorPanel`). Màn hẹp: cả hai cũng chuyển sang phần "Kết quả" và cuộn tới đầu.
- Thẻ "Bài tập tiếp theo →" (S0-36) nằm đầu tab "Kiểm tra" khi đạt hết, vẫn nhận focus.
- "Làm lại từ đầu" hỏi lại ngay trong trang ("Làm lại" / "Thôi", Esc = thôi), không dùng `confirm()`; focus vào nút "Làm lại", xong thì trả về nút icon.
- Nhớ trong `localStorage` (lựa chọn giao diện, không phải dữ liệu học): cỡ chữ editor `lalakode.editor-font` (14–22px), chiều cao và trạng thái thu gọn của panel `lalakode.results-panel`.
- Thanh Chạy thử / Nộp bài lặp lại trên topbar (`TopbarSlot`) chỉ khi thanh dưới editor bị cuộn khuất — không bao giờ có hai bộ nút cùng lúc.
- Giữ: timeout của worker chặn vòng lặp vô hạn, `aria-live` trong từng tab kết quả.

| | 1440 | 820 | 390 |
| --- | --- | --- | --- |
| Trước (S0-38) | ![](design/screenshots/s038-sau-bai-tap-1440.png) | ![](design/screenshots/s038-sau-bai-tap-820.png) | ![](design/screenshots/s038-sau-bai-tap-390.png) |
| Sau, mới mở | ![](design/screenshots/s039-sau-bai-tap-1440.png) | ![](design/screenshots/s039-sau-bai-tap-820.png) | ![](design/screenshots/s039-sau-bai-tap-390.png) |
| Sau, nộp đúng | ![](design/screenshots/s039-sau-bai-tap-dung-1440.png) | ![](design/screenshots/s039-sau-bai-tap-dung-820.png) | ![](design/screenshots/s039-sau-bai-tap-dung-390.png) |

Tab "Đề" ở 390px (cả trang): ![](design/screenshots/s039-sau-tab-de-390.png)

Nút: "Nộp bài" `primary`, "Chạy thử" `dark`, "Dừng" `outline`.

### Bài trước / bài tiếp (S0-36)

Thứ tự lấy từ `content/navigation.ts` (hàm thuần: `order` của khoá, `exercises` của bài học). `NeighbourLinks` là `<nav aria-label="Chuyển bài">` gồm hai `<Link>` thật, cao ≥ 44px, nhãn đọc to đầy đủ ("Bài tập tiếp: Sửa lỗi giúp bạn").

| Màn | Thanh trước/tiếp | Nút chính đi tiếp |
| --- | --- | --- |
| Bài tập | Dưới thanh nút, cột trái. Bài tập đầu: "← Về bài học"; bài tập cuối: "Bài học tiếp →"; hết khoá: "Về trang khoá học" (S0-37). Luôn là `outline` — giai đoạn 0 không khoá bài | Nộp đúng hết → thẻ `NextStepCard` (nền `success-surface`) ở khu kết quả với nút `primary`, **nhận focus** để bấm Enter là đi tiếp. Câu khen đọc lại tiến độ vừa lưu: chỉ nói "Em đã xong bài học này!" / "…cả khoá học!" khi đúng là vậy |
| Bài học | Cuối trang, dưới đường kẻ: "← Bài học trước" · "Bài học tiếp →" (bài cuối: "Về trang khoá học") | "Bài học tiếp" thành `primary` khi đã xong mọi bài tập của bài này; chưa xong thì nút chính vẫn là "Làm tiếp bài chưa xong" |

Đi thẳng từ bài tập này sang bài tập khác không dựng lại màn hình (cùng route): kết quả, lỗi, hình rùa của bài cũ được xoá ngay, lần chạy dở bị dừng và kết quả của nó bị bỏ.

| Bài tập đúng, 1440 | Bài tập đúng, 390 | Bài học, 390 |
| --- | --- | --- |
| ![](design/screenshots/s036-sau-bai-tap-dung-1440.png) | ![](design/screenshots/s036-sau-bai-tap-dung-390.png) | ![](design/screenshots/s036-sau-bai-hoc-390.png) |

| | 1440 | 1180 (tablet ngang) | 820 (tablet dọc) | 390 |
| --- | --- | --- | --- | --- |
| Trước | ![](design/screenshots/s032-truoc-bai-tap-rua-1440.png) | — | ![](design/screenshots/s032-truoc-bai-tap-rua-820.png) | ![](design/screenshots/s032-truoc-bai-tap-rua-390.png) |
| Sau | ![](design/screenshots/s032-sau-bai-tap-rua-1440.png) | ![](design/screenshots/s032-sau-bai-tap-rua-1180.png) | ![](design/screenshots/s032-sau-bai-tap-rua-820.png) | ![](design/screenshots/s032-sau-bai-tap-rua-390.png) |
