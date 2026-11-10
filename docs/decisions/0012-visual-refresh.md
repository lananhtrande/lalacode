# 0012 — Làm mới giao diện: Be Vietnam Pro, bảng màu xám ấm, chữ gọn hơn, vùng bấm 40px
Trạng thái: Chấp nhận
Ngày: 2026-11-10
Theo: `docs/prompts/2026-11-10-visual-refresh.md` (S0-41). Prompt gọi ADR này là "0013"; repo chưa có 0012 nên dùng số kế tiếp.
Thay một phần: ADR 0009 (font Inter cho giao diện), ADR 0010 (giá trị màu nhấn), ADR 0008 (chữ tối thiểu 14px, vùng bấm 44px). Giữ nguyên: logo, quy tắc "San hô chỉ ở logo", "màu không là tín hiệu duy nhất", màu `success`/`attention`/`ai-surface`, cấu trúc học bài của ADR 0011.

## Bối cảnh
Người duy trì muốn LaLaKode có **cảm giác thị giác** gần với một nền tảng học code cho người lớn mà họ đã khảo sát: chữ gọn, nền xám ấm, thẻ phẳng viền mảnh, nút bo nhẹ. Các số đo (font, cỡ, màu, bo góc, khoảng cách) lấy từ computed style của trang đó và đã được duyệt trên bản mẫu. **Chỉ lấy hệ số đo** — không lấy logo, hình minh hoạ, icon riêng, chữ hay nội dung của trang tham khảo.

## Quyết định

**Font.** Be Vietnam Pro (OFL) cho mọi chữ giao diện, 400/500/600/700; JetBrains Mono (OFL) cho editor, console, khối code, `code` inline, 400/500/700, `font-variant-ligatures: none`. Tự host woff2 lấy từ gói `@fontsource` 5.3.0 (chỉ chép file, không thêm dependency), chia ba bảng chữ theo `unicode-range`, `font-display: swap`, preload bản 400 vietnamese + latin. Bảng vietnamese khai báo **sau** latin-ext để chữ ư/ơ/đ/ă không kéo thêm file latin-ext. Font trang chủ: ~136 kB (Inter variable cũ ~40 kB) — chấp nhận vì Be Vietnam Pro vẽ dấu tiếng Việt đẹp hơn ở cỡ nhỏ; ngân sách ghi trong `docs/tech-stack.md`. Logo vẫn là Inter đã chuyển thành nét, nên bỏ file Inter và `build-inter.sh`.

**Màu.** Nền trang `#F3F2EF`, nền lõm `#F7F7F6` (`surface-sunken`), viền `#E8E8E8` / `#EFEFEF` (`line-soft`), chữ `#1B1B1B` / `#696969`, màu nhấn `#2D65BC` (chữ trắng 5.7:1) / `#24539C`, nền tối ngoài editor `#24242A` (`ink-surface`: mục lục học bài, nút "Chạy thử"), editor `#2A2A30`. Nhãn độ tuổi xanh lá nhạt (`fresh-*`). Mọi cặp chữ/nền có trong `tokens.test.ts`. Hai chỗ phải chỉnh để giữ luật cũ:
- `code-active` `#33333A`, `code-muted` `#A3A3AC`, `code-function` `#6EE7E0` (để số dòng ≥ 4.5:1 trên dòng đang đứng, và tên hàm cách màu nhấn ≥ 30° sắc độ).
- `success` giữ nguyên theo yêu cầu, nên "đạt" và màu nhấn chỉ còn cách nhau 1.39 về độ sáng (ADR 0010 đặt 1.5). Vẫn cách nhau 75° sắc độ, "đạt" luôn là chữ/icon trên nền nhạt còn nút là mảng xanh đặc. Ngưỡng test hạ còn 1.35. **Người duy trì nên xem lại**: nếu thấy trẻ nhầm, đổi `success` đậm hơn.

**Cỡ chữ.** `h1` 24/32, `h2` 18/26, tiêu đề thẻ 16/1.35, chữ thân 16/24 (bài học 16/26), chữ phụ và nhãn nút 14/21, **`text-meta` 12/16** mới. Luật cũ "không nhỏ hơn 14px" đổi thành: **12px chỉ cho `text-meta`** (nhãn, số phụ như "20 bài · khoảng 5 giờ", % tiến độ); câu cần đọc tối thiểu 14px.

**Hình khối.** Thẻ bo 20px, viền mảnh, **không bóng**; chỉ khung lọc có bóng rất nhẹ. Nút bo **8px** (bỏ viên thuốc): `md` 40px, `sm` 36px (nút trong thẻ), nút phụ nền màu nhấn 5% chữ màu nhấn. Thanh menu cao 64px, nội dung tối đa 1280px; vùng nội dung tối đa 1600px, đệm 32px (16px dưới 640px).

**Vùng bấm 40px** (hạ từ 44px của ADR 0008) để khớp hệ mới. Chip trạng thái 32px nằm trong nhóm cao 40px. Vẫn trên ngưỡng 24×24px của WCAG 2.2 AA (2.5.8), nhưng dưới mức 44px khuyến nghị cho trẻ nhỏ của ADR 0008 — theo dõi trong beta (S0-27): trẻ bấm trượt nhiều thì nâng lại.

## Hệ quả
- Tốt: chữ tiếng Việt có dấu đẹp và đều hơn; trang gọn, nhiều nội dung hơn trên một màn; code dễ đọc nhờ font mono có subset tiếng Việt.
- Xấu: font tải nặng hơn ~3 lần so với Inter variable (vẫn trong ngân sách mới).
- Xấu: vùng bấm nhỏ hơn và chữ meta 12px — cần quan sát với trẻ thật.
