# Prompt cho Claude Code — Màu nhấn xanh dương + nút sang bài tiếp theo

> Cách dùng: mở Claude Code trong repo và gõ
> `Đọc docs/prompts/2026-11-05-blue-accent-next-links.md và thực hiện.`

## Bối cảnh

Sau S0-34, người duy trì dùng thử và quyết định:
1. **Logo:** bỏ con trỏ ở cuối chữ, và tên viết thành **LaLaKode** (L, L, K hoa). *Logo đã làm* — các file trong `apps/web/public/brand/` và `docs/brand/` đã cập nhật, đang ở trạng thái chưa commit trên nhánh hiện tại. Commit chúng đầu tiên (`chore(brand): LaLaKode wordmark without the trailing cursor`). Không sửa tay các SVG. Trong cùng commit, đổi mọi chỗ **hiển thị** tên sản phẩm sang `LaLaKode`: `vi.app.name`, `alt` của logo, `<title>` và mô tả trong `index.html`, `name`/`short_name` trong manifest, `README.md`, trang giới thiệu/quyền riêng tư — và test/e2e dò theo tên. **Không** đổi tên kỹ thuật (tên package `@lalakode/*`, tên repo, bucket, đường dẫn).
2. **Màu nhấn của web đổi về xanh dương.** San hô trên nút và ký hiệu dễ bị trẻ nhầm với báo lỗi. **Logo giữ màu San hô** — San hô chỉ còn là màu thương hiệu của biểu tượng, không dùng cho nút, link, trạng thái hay ký hiệu nào trong giao diện.
3. **Bài học và bài tập cần nút đi tới bài tiếp theo.**

Đọc trước: `CLAUDE.md`, `docs/decisions/0009-brand-coral-inter.md`, `docs/design-system.md`, `apps/web/src/index.css`, `features/lesson/LessonPage.tsx`, `features/exercise/ExercisePage.tsx`, `content/loader.ts`, `content/types.ts`, `progress/` (cách biết bài nào đã xong).

Hai phần, hai PR (hoặc hai commit tách bạch nếu nhánh S0-34 chưa merge — hỏi người duy trì nếu không rõ):
- **S0-35** Màu nhấn xanh dương — nhánh `feat/S0-35-blue-accent`
- **S0-36** Điều hướng bài trước/tiếp — nhánh `feat/S0-36-next-links`

---

## S0-35 — Màu nhấn xanh dương

- Token `accent` sang một **xanh dương** rõ, đáng tin (khoảng `#2563EB`; tự chọn và đo). Vì xanh dương đậm, **chữ trên nút chính chuyển sang trắng** (`on-accent` `#FFFFFF`, phải ≥ 4,5:1). `accent-strong` cho link/chữ nhấn (≥ 4,5:1 trên `surface` và `surface-muted`), `accent-soft` cho nền mục đang chọn (chữ trên nó vẫn đạt AA), viền focus thấy rõ trên nền trắng và trên editor tối.
- Xanh dương phải **tách hẳn** khỏi `success` (xanh lá), `attention` (mù tạt) và màu lỗi — khác cả sắc độ lẫn độ sáng. Không có chỗ nào màu đỏ/cam ngoài trạng thái lỗi/cần chú ý.
- Grep mọi màu San hô còn dùng trong UI (`e8553a`, `b8381f`, `fdece7`, `coral`, `san-ho`) và thay bằng token mới. Ngoại lệ duy nhất: các file logo/favicon. `theme-color` trong `index.html` và `theme_color` trong manifest đặt theo màu nhấn xanh dương mới (thanh trình duyệt là giao diện, không phải logo).
- Màu cú pháp editor (`--color-code-*`): kiểm tra không có màu nào trùng gần với màu nút hoặc lỗi; vẫn đạt AA trên nền code.
- Cập nhật `/dev/design`, test tương phản token, `docs/design-system.md`, và viết ADR `0010-blue-accent.md` (thay phần màu nhấn của 0009; ghi lý do: trẻ nhầm San hô với lỗi; logo giữ San hô và quy tắc “San hô chỉ ở logo”).
- Ảnh chụp trước/sau trang chủ, bản đồ, bài tập (đang chạy, có lỗi, đã đúng) ở 1440 và 390.

## S0-36 — Nút sang bài tiếp theo

### Thứ tự
Thứ tự đi theo `order` của khoá học và `exercises` của từng bài học. Viết **một hàm thuần** (ví dụ `content/navigation.ts`) nhận `ContentIndex` (+ danh sách bài tập của bài học khi cần) và trả về `{ previous, next }` cho một bài học hoặc một bài tập, có unit test đủ các biên: bài tập đầu/cuối của bài học, bài học đầu/cuối của khoá, khoá chỉ có một bài. Không gọi mạng thêm nếu dữ liệu đã có trong index; nếu cần danh sách bài tập của bài học kế tiếp thì chỉ cần id bài học, không tải trước bài tập.

### Màn bài tập (`/bai-tap/:id`)
- **Thanh điều hướng luôn có** ở cuối cột trái (dưới thanh nút) hoặc đầu trang: `← Bài tập trước` · `Bài tập tiếp →`. Là `<Link>` thật (không phải button), có `aria-label` đầy đủ (“Bài tập tiếp: Góc vuông”), ≥ 44 px.
- **Khi nộp bài đúng** (tất cả test pass): ở khu kết quả hiện thẻ chúc mừng với nút chính **“Bài tập tiếp theo →”** (nút primary, focus được đưa vào nút này sau khi kết quả hiện, để trẻ bấm Enter là đi tiếp). Bài tập cuối của bài học → nút **“Hoàn thành bài học · Sang bài học tiếp →”** dẫn tới trang bài học kế tiếp; bài cuối của khoá → **“Về bản đồ”** + lời chúc mừng hoàn thành khoá.
- Chưa làm đúng vẫn được đi tiếp (giai đoạn 0 không khoá bài) — nhưng nút tiếp khi chưa đúng là dạng phụ (outline/ghost), chỉ khi đúng mới là nút chính.
- Phím tắt không bắt buộc; nếu thêm thì không được chặn phím khi đang gõ trong editor.

### Màn bài học (`/bai-hoc/:id`)
- Giữ nút vào bài tập hiện có. Cuối trang thêm `← Bài học trước` · `Bài học tiếp →`. Nếu trẻ đã xong mọi bài tập của bài này (đọc từ progress), nút **“Bài học tiếp →”** là nút chính.
- Bài học cuối khoá → “Về bản đồ”.

### Văn bản
Thêm chuỗi vào `shared/i18n/vi.ts` (giọng thân thiện, xưng “em”), ví dụ: “Bài tập tiếp theo”, “Bài tập trước”, “Bài học tiếp theo”, “Bài học trước”, “Em đã xong bài học này!”, “Em đã hoàn thành cả khoá học!”, “Về bản đồ”.

### Kiểm tra
- Unit test `navigation.ts` (các biên ở trên) + test component: bài tập đúng → nút chính “Bài tập tiếp theo” có `href` đúng và nhận focus.
- E2E: làm đúng bài 1 của lesson 01 → bấm “Bài tập tiếp theo” → tới đúng bài 2; ở bài tập cuối lesson 01 → nút dẫn tới lesson 02; trên trang lesson cuối → “Về bản đồ”. Chạy cả Chromium và WebKit, viewport 1280 và 390.
- `npm run check`, `npm run test:e2e` xanh; gọi `content-reviewer` không cần (không đổi nội dung), `privacy-reviewer` không cần trừ khi đọc thêm dữ liệu progress mới.
- Cập nhật `docs/roadmap-stage0.md` (S0-35, S0-36).
