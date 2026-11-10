# Prompt cho Claude Code — Dựng lại giao diện: khoá học, trình học bài, bài thực hành, luyện tập

> Cách dùng: mở Claude Code trong repo, chuyển về `main` đã merge S0-35/S0-36, rồi gõ
> `Đọc docs/prompts/2026-11-10-ui-rebuild.md và thực hiện.`

## Bối cảnh

Người duy trì đã khảo sát một nền tảng học code chạy trong trình duyệt dành cho người lớn và muốn LaLaKode có **cấu trúc** tương tự: catalog khoá học, trình học bài có mục lục bên trái, bài thực hành dạng chia đôi, kho luyện tập. Chỉ **học cách tổ chức**: không chép giao diện, chữ, hình minh hoạ, tên bộ đề hay nội dung của bất kỳ trang nào. Hình minh hoạ tự vẽ (SVG phẳng) trong repo.

Đọc trước: `CLAUDE.md`, `docs/design-system.md`, ADR 0007–0010, `docs/privacy.md`, `docs/content-format.md`, `apps/web/src/app/routes.tsx`, `RootLayout.tsx`, `features/map/`, `features/lesson/`, `features/exercise/`, `content/` (loader, types, navigation), `progress/`.

### Giữ nguyên (không đổi trong đợt này)
- Stack hiện tại: Vite + React Router + CodeMirror 6 + Pyodide trong Web Worker. **Không** chuyển sang Next.js hay Monaco.
- Giai đoạn 0: web tĩnh, không tài khoản, không lưu dữ liệu trẻ phía server; tiến độ ở IndexedDB như hiện có.
- Token màu, font Inter, component `Button`/`Card`/`AiPanel`, quy tắc "San hô chỉ ở logo", xanh dương = hành động. Đỏ/cam không dùng; lỗi vẫn là `attention` + icon + chữ.
- Đường dẫn tiếng Việt.

### Không làm (ghi lý do vào ADR)
- Bảng xếp hạng, bình luận dưới bài, đăng nhập Google, bảng giá, quảng cáo, tỉ lệ đúng/số lượt nộp: cần server hoặc tạo áp lực/thu thập dữ liệu trẻ. Để giai đoạn sau, và chỉ bật khi phụ huynh đồng ý.
- Chế độ tối cho toàn trang: chưa làm. Ngoại lệ có sẵn (editor, console) cộng thêm sidebar của trình học bài (xem S0-38).

Bốn phần, bốn nhánh/PR theo thứ tự. Mỗi phần: test, `npm run check`, `npm run test:e2e` (Chromium + WebKit, 1280 và 390) xanh, ảnh trước/sau ở 1440/820/390 vào `docs/design/screenshots/s03x-*`, cập nhật `docs/design-system.md` và `docs/roadmap-stage0.md`. Viết **ADR 0011** `learning-layout.md` ở S0-37 cho cả đợt (cấu trúc mới, sidebar tối, những thứ không làm ở trên).

---

## S0-37 — Catalog khoá học và trang khoá (`feat/S0-37-course-catalog`)

### Nội dung: thêm chương
`course.json` thêm `chapters` (zod: mảng `{ id, title, lessons: string[] }`; mọi id trong `order` thuộc đúng một chương, test chốt). Đề xuất 4 chương, 5 bài mỗi chương:
1. **Làm quen với Python**: 01–05
2. **Ra quyết định và lặp lại**: 06–10
3. **Chữ, số và dữ liệu**: 11–15
4. **Vẽ, chơi và dự án**: 16–20

Thêm `level` (`"moi-bat-dau" | "co-ban" | "nang-cao"`, khoá này là `moi-bat-dau`), `tags` và `illustration` (tên file SVG). Sửa luôn hai lỗi nội dung: `summary` vẫn ghi "Mười bài ngắn" (khoá có 20 bài) và `lesson.md` bài 10 vẫn ghi "Bài cuối của khoá rồi đấy". Gọi `content-reviewer`.

### `/khoa-hoc` (catalog), thay cho mục "Bản đồ" trong nav
- Khung lọc bo góc ở đầu trang: chip trạng thái (Tất cả · Đang học · Đã xong · Chưa học), chip cấp độ, ô tìm theo tên, dòng "N khoá học". Lọc chạy phía client, giữ trạng thái lọc trên URL (`?trang-thai=dang-hoc`).
- Lưới card: 1 cột (<640), 2 (≥640), 3 (≥1024), 4 (≥1440). Card: hình minh hoạ phẳng nền pastel nhạt (tự vẽ, mỗi khoá một hình, có `alt`) → badge cấp độ (icon cột + chữ, không chỉ màu) → tiêu đề → mô tả cắt 2 dòng (`line-clamp-2`, kiểm tra chữ có dấu không bị cắt nửa) → "20 bài · khoảng 5 giờ" → thanh tiến độ khi đã bắt đầu (`role="progressbar"`, có số %) → nút.
- Nút theo trạng thái: chưa học "Khám phá →" (`outline`); đang học "Tiếp tục bài N →" (`primary`, tới bài đầu tiên chưa xong); xong hết "Ôn lại →" (`outline`).
- Hiện có một khoá: thêm một card **"Sắp có"** không bấm được (khung nét đứt, không ghi tên khoá cụ thể) để lưới không trống. Không tạo nội dung giả.
- Trạng thái rỗng khi lọc không ra: "Không có khoá học nào khớp. Thử bỏ bớt bộ lọc nhé." + nút xoá lọc.

### `/khoa-hoc/:courseId` (trang khoá), thay cho `/ban-do`
- Đầu trang: hình, tiêu đề, mô tả, cấp độ, "x/20 bài đã xong", thanh tiến độ, nút chính "Bắt đầu" hoặc "Tiếp tục bài N →". Giữ `StreakBanner`.
- Danh sách chương dạng accordion (`<details>`, mở sẵn chương đang học): tiêu đề chương, "3/5 bài". Mỗi bài một dòng: số thứ tự, tên, icon trạng thái (xong: ✓ `success` + chữ "Đã xong"; đang học; chưa học), số phút, "2/4 bài tập". Bỏ chip "Bản nháp" ở màn trẻ xem (chỉ hiện khi `import.meta.env.DEV`).
- `/ban-do` chuyển hướng (`replace`) sang `/khoa-hoc/py-khoi-dong`. Sửa link cũ trong app và test.

### Nav
Sidebar: **Trang chủ · Khoá học · Luyện tập · Huy hiệu · Giới thiệu**. "Luyện tập" để `ComingSoon` cho tới S0-40. Trang chủ: nút chính dẫn tới "Tiếp tục bài N" nếu đã học, không thì `/khoa-hoc`.

---

## S0-38 — Trình học bài (`feat/S0-38-lesson-player`)

Áp cho `/bai-hoc/:id` và `/bai-tap/:id`. Hai route này **không dùng sidebar chung** của app mà dùng khung học bài riêng (route `handle: { layout: 'learn' }`).

### Sidebar mục lục (bên trái, 280px, nền tối)
- Nền `ink`/token mới `learn-bg` (đặt trong `@theme`, đo AA cho chữ thường, chữ phụ, mục đang chọn, viền focus; thêm cặp vào `tokens.test.ts`). Ghi vào ADR 0011 vì đây là ngoại lệ mới của nguyên tắc "chỉ giao diện sáng".
- Trên cùng: logo nhỏ (bản `lalakode-logo-dark.svg`) dẫn về trang khoá, tên khoá, "7/20 bài · 35%" + thanh tiến độ.
- Chương dạng accordion ("Chương 2 · Ra quyết định và lặp lại", "1/5"). Trong mỗi bài học: một dòng cho phần học (icon video/đọc) và các dòng bài tập con (icon bài tập), mỗi dòng có trạng thái xong/chưa bằng icon + chữ ẩn cho trình đọc màn hình. Mục đang mở tô sáng (`aria-current="page"`), tự cuộn vào tầm nhìn khi vào trang.
- Thu gọn được: nút ở đầu sidebar thu còn dải icon 64px; lựa chọn lưu `localStorage` (bọc try/catch). Ở màn bài tập ≥1024px **mặc định thu gọn** để editor rộng.
- <1024px: sidebar thành ngăn kéo mở bằng nút "Mục lục" trên topbar; Esc/bấm ra ngoài thì đóng, trả focus về nút.

### Topbar
Breadcrumb `Khoá học › Python khởi động › Bài 3 · Rùa vẽ hình` (`<nav aria-label="Vị trí">`), bộ đếm "Bài 3/20", ở màn bài tập thêm "Bài tập 2/4". Bên phải: trạng thái "Python sẵn sàng" (đã có).

### Bài học (`/bai-hoc/:id`)
- Cột nội dung rộng tối đa ~720px, căn giữa vùng còn lại. Thứ tự: nhãn chương nhỏ in hoa (`text-small`, `ink-soft`) → `h1` → **video bài giảng** (`LessonVideo` đã có; chưa có video thì ẩn hẳn, không để khung trống) → khối "Nội dung bài" liệt kê các `h2` thành link neo (tự sinh từ markdown, có `id` ổn định theo slug tiếng Việt bỏ dấu) → thân bài → danh sách bài tập của bài → `NeighbourLinks`.
- Ở ≥1280px, "Nội dung bài" có thể dính bên phải (sticky) và tô mục đang đọc; dưới 1280px nằm đầu bài.

---

## S0-39 — Bài thực hành chia đôi (`feat/S0-39-practice-split`)

### Nội dung: thêm trường cho đề bài (tuỳ chọn trong schema)
`difficulty` (`"de" | "vua" | "kho" | "thu-thach"`), `requirements: string[]` (markdown inline), `examples: { input?: string, output: string, note?: string }[]`. Điền cho **toàn bộ bài tập của bài 01–05** trong PR này (lấy output từ `solution` chạy thật, không đoán; có test so `examples[].output` với kết quả chạy `solution`). Bài 06–20 điền trong một PR nội dung riêng (thêm mục vào roadmap). Gọi `content-reviewer`.

### Bố cục ≥1024px
- **Trái (~40%, tự cuộn):** badge độ khó (chữ + icon, không chỉ màu: Dễ · Vừa · Khó · Thử thách), `h1`, đề bài, "Yêu cầu" dạng bullet (code inline dùng nền `code-bg` như hiện có, **không tô đỏ**), "Ví dụ" (khối Đầu vào / Kết quả mong đợi, nền code tối), gợi ý AI (`HintPanel`) ở cuối cột trái.
- **Phải trên:** editor tối. Header: nhãn "Python", nút icon "Làm lại từ đầu" (có hộp xác nhận nhỏ trong trang, không dùng `confirm()`), cỡ chữ A−/A+ (lưu `localStorage`). Trạng thái "Đang tải editor…" và "Đang tải Python…" rõ ràng.
- **Phải dưới:** panel kéo đổi chiều cao (thanh kéo dùng được bằng bàn phím: mũi tên lên/xuống, `role="separator"` + `aria-valuenow`), nhớ chiều cao. Hai tab **"Kết quả"** (console + hình rùa) và **"Kiểm tra (N)"** (danh sách test: đạt/chưa đạt kèm `message`). Trạng thái rỗng: "Bấm Chạy thử để xem kết quả". Nút "Thu gọn" panel. Nộp xong tự chuyển sang tab "Kiểm tra"; lỗi Python hiện ở tab "Kết quả" bằng `ErrorPanel` thân thiện.
- **Nút hành động:** "Chạy thử" (`dark`) và "Nộp bài" (`primary`) ở thanh dưới editor **và** lặp lại ở topbar (khi thanh dưới bị cuộn khuất). Chạy thử = chạy code, chỉ hiện output; Nộp bài = chạy toàn bộ test. Thẻ "Bài tập tiếp theo →" (S0-36) hiện đầu tab "Kiểm tra" khi đạt hết và vẫn nhận focus.
- Giữ: chặn vòng lặp vô hạn bằng timeout của worker, `aria-live` cho khu kết quả, phím tắt không chặn khi đang gõ.

### <1024px
Ba tab dính đầu màn: **Đề · Code · Kết quả**. Thanh Chạy thử/Nộp bài dính đáy (như S0-32). Chạy/nộp xong tự chuyển sang tab "Kết quả"/"Kiểm tra".

---

## S0-40 — Kho luyện tập (`feat/S0-40-practice-bank`)

`/luyen-tap`: mọi bài tập của mọi khoá, tạo từ content index lúc build (không tải từng file bài tập).

- **Băng "Bộ bài" cuộn ngang** ở đầu: mỗi chương của khoá là một bộ ("Làm quen với Python · 0/18"), card có tiến độ. Cuộn được bằng bàn phím/nút trái phải, có `scroll-snap`.
- **Lọc (sidebar trái ≥1024px, ngăn kéo "Bộ lọc" khi hẹp):** độ khó (Dễ · Vừa · Khó · Thử thách, mỗi mục có đếm), chủ đề (lấy từ `tags` của bài học: print, biến, rùa, if, vòng lặp, list, hàm, chuỗi, dict, random…), trạng thái (Chưa làm · Đã xong). Lọc giữ trên URL.
- **Danh sách** (bảng ở màn rộng, thẻ ở màn hẹp): trạng thái (icon + chữ ẩn), tên bài tập, thuộc bài nào, độ khó. **Không** có tỉ lệ đúng, lượt nộp, sao đánh giá. Nút "Bài ngẫu nhiên" (chọn trong các bài chưa xong theo bộ lọc hiện tại). Đánh dấu "Để dành" (lưu IndexedDB cùng progress).
- **Cột phải (≥1280px):** "Tiếp tục" (bài tập chưa xong đầu tiên theo thứ tự khoá), "Thử thách hôm nay" (chọn theo ngày, tất định từ ngày địa phương — mọi máy cùng ngày thấy cùng một bài, không gọi mạng), lịch chuỗi ngày học của tháng (dùng dữ liệu streak đã có, ô có ngày học kèm icon, không chỉ màu).
- Trạng thái rỗng khi lọc không ra; trạng thái chưa làm bài nào ("Chọn một bài để bắt đầu nhé!").
- `privacy-reviewer`: xác nhận "Để dành" và lọc chỉ ở trình duyệt, không có dữ liệu mới rời máy.

---

## Văn bản
Mọi chuỗi mới vào `shared/i18n/vi.ts`, giọng thân thiện, xưng "em", câu ngắn. Không dùng từ tiếng Anh khi có từ Việt dễ hiểu (Test case → "Kiểm tra", Submit → "Nộp bài", Practice → "Luyện tập").

## Kiểm tra chung
- Unit: schema chương (mỗi bài đúng một chương), lọc catalog, lọc kho luyện tập, chọn "Thử thách hôm nay" tất định, sinh id neo từ tiêu đề tiếng Việt, `examples` khớp output của `solution`.
- Component: sidebar thu gọn/mở + `aria-current`, panel kéo bằng bàn phím, tab Kết quả/Kiểm tra tự chuyển khi nộp.
- E2E: `/khoa-hoc` → "Khám phá" → trang khoá → bài 1 → video/nội dung → bài tập 1 → Chạy thử → Nộp bài đúng → "Bài tập tiếp theo"; `/ban-do` chuyển hướng; `/luyen-tap` lọc "Dễ" + "Bài ngẫu nhiên"; trên 390px đổi tab Đề/Code/Kết quả.
- Lighthouse/axe không có lỗi a11y mới; ngân sách bundle trong `docs/tech-stack.md` không vượt (route mới lazy).
