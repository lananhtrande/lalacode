# Prompt cho Claude Code — Design system riêng cho lalacode + màn bài tập 2 cột

> Cách dùng: mở Claude Code trong repo và gõ
> `Đọc docs/prompts/2026-10-30-ui-redesign.md và thực hiện, làm từng phần một.`

---

## Bối cảnh

Web lalacode (UI hiển thị tên "lalakode") đã xong phần lớn giai đoạn 0. Giờ làm một design system **riêng** cho lalacode — học hỏi các nguyên lý từ một bản thiết kế tham khảo (mục 1), **không sao chép** màu, font, component hay bố cục của nó — và sắp xếp lại màn bài tập `/bai-tap/:exerciseId` cho dễ học.

Đọc trước: `CLAUDE.md`, `docs/conventions.md`, `docs/privacy.md`, `docs/testing.md`, rồi các file:
`apps/web/src/index.css`, `app/RootLayout.tsx`, `shared/ui/CodeEditor.tsx`, `features/exercise/*.tsx`, `shared/i18n/vi.ts`, `e2e/exercise.spec.ts`.

Trang mẫu để so trước/sau: http://localhost:5173/bai-tap/py-khoi-dong.03-rua-ve-hinh.02-goc-vuong (bài có `turtle`) và một bài không có turtle, ví dụ `py-khoi-dong.01-xin-chao.01-in-loi-chao`.

## Chia việc (mỗi phần một nhánh, một PR, thêm vào roadmap)

- **S0-31 Design system mới:** token, font, nút, thẻ, khung trang (sidebar). Không đổi bố cục từng màn ngoài những gì khung trang buộc phải đổi.
- **S0-32 Màn bài tập 2 cột:** editor nền tối bên trái, kết quả bên phải.
- **S0-33 Áp design system cho các màn còn lại:** trang chủ, bản đồ, bài học, huy hiệu, báo cáo, tiến độ, giới thiệu, quyền riêng tư.

Làm S0-31 (dừng ở trang `/dev/design` để người duy trì chọn màu + font) → S0-32 → dừng, chụp màn hình cho người duy trì xem → rồi mới S0-33.

---

## 1. Design system riêng của lalacode (S0-31)

**Nguyên tắc: học hỏi phong cách, không sao chép.** Người duy trì đã xem một file Figma tham khảo và rút ra các *nguyên lý* bên dưới. Không có mã màu, font, tên component hay bố cục nào được lấy nguyên từ file đó — bạn tự thiết kế bản sắc riêng cho lalacode, phù hợp trẻ 10–15 tuổi, và giải thích lựa chọn trong ADR.

### Nguyên lý rút ra từ bản tham khảo
1. **Nền trung tính, ít màu; một màu nhấn rực duy nhất** dùng cho hành động chính và trạng thái "đang chọn". Mọi thứ khác là đen/xám/trắng → mắt trẻ biết ngay phải bấm đâu.
2. **Tương phản cao:** chữ gần đen trên nền trắng; nút chính có chữ tối trên màu nhấn sáng.
3. **Hình khối mềm, thân thiện:** nút bo tròn hẳn (dạng viên thuốc), thẻ bo góc lớn, bóng đổ rất nhẹ, nhiều khoảng trắng.
4. **Phân cấp chữ rõ, ít cỡ:** khoảng 5–6 kiểu chữ có tên theo vai trò (tiêu đề trang, tiêu đề mục, tiêu đề thẻ, thân, phụ, nhãn nút).
5. **Một màu nền riêng, rất nhạt, cho mọi thứ do AI tạo ra** (khung gợi ý) — trẻ phân biệt được đâu là gợi ý của AI.
6. **Màu trạng thái có nghĩa cố định:** một màu cho "đúng/hoàn thành", một màu cho "cần chú ý" — luôn kèm icon + chữ.
7. **Khung trang dạng sidebar** trên màn rộng, mục đang chọn được tô đậm; nội dung đặt trong thẻ trên nền xám rất nhạt.

### Việc bạn cần làm
- **Bảng màu riêng:** đề xuất 2 phương án (ví dụ: nhấn bằng một màu tươi phù hợp trẻ — xanh ngọc, cam san hô, tím… — **khác** với màu vàng chanh của bản tham khảo), mỗi phương án gồm: chữ chính, chữ phụ, nền, nền phụ, đường chia, màu nhấn + chữ trên màu nhấn, nền AI, thành công, cần chú ý. Tạo trang `/dev/design` (chỉ chạy ở dev, giống `RunnerSandboxPage`) hiển thị cả 2 phương án với nút, thẻ, khung gợi ý, editor tối — rồi **dừng lại hỏi người duy trì chọn**.
- Mọi cặp chữ/nền đạt **WCAG AA (≥ 4.5:1)**; xám dùng cho placeholder/disabled không được dùng cho chữ thân.
- **Font riêng:** chọn một font sans hiện đại, giấy phép mở (OFL), **thiết kế tốt cho tiếng Việt** — ứng viên: *Be Vietnam Pro*, *Lexend* (dễ đọc cho người mới đọc), *Nunito* (tròn, thân thiện). Không dùng HK Grotesk/Hanken Grotesk. Kiểm tra hiển thị chuỗi `Hoàn thành! Ổ bánh mì, ước mơ, Đội bóng` và chụp màn hình. Tự host (woff2 trong `apps/web/public/fonts/`, kèm file giấy phép), chỉ 2–3 độ đậm, `font-display: swap`.
- **Thang chữ cho trẻ:** chữ thân tối thiểu 16/24; chữ phụ tối thiểu 14; tiêu đề trang 28–32 trên desktop.
- **Component:** `Button` (primary | dark | outline | ghost, ≥ 44px, dạng viên thuốc), `IconButton` tròn, `Card` (bo góc ~16px, bóng nhẹ), `AiPanel` (nền AI). Đặt trong `shared/ui/`, thay các nút đang viết class tay.
- **Dấu ấn riêng cho trẻ** (tuỳ chọn, nhẹ): ví dụ icon con rùa nhỏ cạnh tên lalakode, hoặc màu nhấn khác nhau cho từng chương trên bản đồ nhiệm vụ. Không dùng linh vật, logo, hình minh hoạ hay chữ từ bản tham khảo.
- Focus: viền 3px tương phản cao, nhìn rõ trên cả nền sáng và editor tối.

### Khung trang (RootLayout)
Áp dụng nguyên lý 7, bố cục cụ thể do bạn thiết kế:
- **Desktop (≥1024px):** sidebar trái ~240px nền trắng: logo/tên `lalakode` trên cùng; mục nav dạng viên thuốc, mục đang chọn nền `ink` chữ trắng, có icon lucide; phía dưới sidebar: link "Mã tiến độ", "Quyền riêng tư". Bên phải: vùng nội dung nền `surface-muted`, nội dung đặt trong thẻ trắng.
- **Mobile/tablet (<1024px):** thanh trên cùng với tên + nút menu (hamburger) mở ngăn kéo nav; hoặc thanh nav dưới đáy 4 mục — chọn một, giải thích lý do.
- Giữ link "Bỏ qua tới nội dung", `aria-label` nav, footer có thể gộp vào sidebar.

### Chế độ tối
Bản tham khảo chỉ có giao diện sáng; để đơn giản giai đoạn 0, bỏ khối `@media (prefers-color-scheme: dark)` cho khung trang (đặt `color-scheme: light`), **trừ** editor và console luôn tối (S0-32). Ghi quyết định vào ADR.

### Cách làm
- Sau khi người duy trì chọn phương án màu: đổi token trong `@theme` của `index.css`, đặt tên theo vai trò (`ink`, `ink-soft`, `surface`, `surface-muted`, `line`, `accent`, `on-accent`, `ai-surface`, `success`, `attention`). Cập nhật mọi class `brand-*`/`accent-*` cũ — tìm hết bằng grep, không để token chết.
- Tạo component dùng chung trong `shared/ui/`: `Button` (variant: primary | dark | outline | ghost, size, icon), `Card`, `IconButton`. Thay các nút đang viết class tay.
- Viết `docs/design-system.md`: bảng token, chữ, nút, thẻ, quy tắc tương phản, ảnh chụp mẫu.
- ADR `0007-visual-design-system.md`: các nguyên lý đã học, vì sao chọn bảng màu và font này (khác bản tham khảo ở đâu), bỏ dark mode khung trang, editor tối.

---

## 2. Màn bài tập 2 cột (S0-32)

### Mục tiêu
Trẻ vừa nhìn code vừa thấy kết quả, không phải cuộn. Hiện tại mọi thứ xếp dọc: bấm "Chạy thử" xong phải cuộn xuống mới thấy kết quả và hình rùa.

### Bố cục desktop (≥1024px, cũng thử ở 1280 và 1440)
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Tên bài học     Tiêu đề bài tập                 [Python sẵn sàng]│
│ Đề bài (RichText) — một thẻ ngắn, có nút thu gọn nếu dài          │
├───────────────────────────────┬──────────────────────────────────┤
│  EDITOR (nền tối)             │  KẾT QUẢ                          │
│  ┌─ thanh: "Code của em" ───┐ │  ┌ Kết quả chạy (console tối) ┐  │
│  │ 1 import turtle          │ │  │ ...                         │  │
│  │ 2                        │ │  └────────────────────────────┘  │
│  │ ...                      │ │  Hình rùa vẽ (nếu bài có turtle)  │
│  └──────────────────────────┘ │  Lỗi (nếu có)                     │
│  [▶ Chạy thử] [➤ Nộp bài]     │  Kết quả chấm từng test           │
│  [■ Dừng] [↺ Làm lại]         │  Gợi ý (HintPanel, nền ai-surface)│
└───────────────────────────────┴──────────────────────────────────┘
```
- Chia cột ~55/45 (editor/kết quả), gap 16–24px. Không giới hạn `max-w-5xl` cho màn này — dùng gần hết chiều rộng còn lại cạnh sidebar.
- Vùng 2 cột cao bằng phần còn lại của màn hình (`calc(100dvh - ...)`), **mỗi cột tự cuộn**; editor co giãn theo chiều cao, tối thiểu ~16 dòng.
- Thanh nút **dính** dưới editor (luôn thấy được). Nút chính "Nộp bài" = primary (vàng), "Chạy thử" = dark, "Dừng" = outline, "Làm lại từ đầu" = ghost.
- Cột phải: thứ tự ưu tiên khi có kết quả mới — lỗi → output → hình rùa → kết quả chấm → gợi ý. Khi chạy xong, cuộn cột phải lên đầu phần vừa cập nhật và đặt `aria-live="polite"` để trình đọc màn hình báo.
- Bài có turtle: canvas hiện ở cột phải, ngay dưới output, có thể lớn hơn 320px nếu cột rộng (giữ tỉ lệ vuông; vẽ lại theo kích thước thực, lưu ý devicePixelRatio).
- (Tuỳ chọn, chỉ nếu nhẹ) thanh kéo đổi tỉ lệ 2 cột, nhớ tỉ lệ bằng `localStorage` bọc try/catch. Không thêm thư viện cho việc này.

### Tablet & điện thoại (<1024px)
- Xếp dọc: đề bài → editor → thanh nút → kết quả.
- Sau khi bấm Chạy/Nộp, **tự cuộn tới khu kết quả** (tôn trọng `prefers-reduced-motion`).
- Thanh nút dính ở đáy màn hình trên điện thoại, để không phải cuộn ngược lên.
- Thử ở 360×740, 820×1180 (tablet dọc), 1180×820 (tablet ngang — có thể dùng 2 cột nếu ≥1024).

### Editor nền tối
- Trong `CodeEditor.tsx`, thêm theme tối **tự viết** (`EditorView.theme({...}, { dark: true })` + `HighlightStyle.define([...])` dùng `@lezer/highlight` tags) — **không** thêm `@codemirror/theme-one-dark` hay `basicSetup` (ngân sách bundle).
- Màu: nền gần đen (hơi ngả theo tông màu của bảng màu đã chọn), gutter khác nền một chút, số dòng xám đạt AA, dòng đang đứng hơi sáng hơn nền, con trỏ và vùng chọn dùng màu nhấn của lalacode (vùng chọn ~25% opacity), chữ thường gần trắng.
- Màu cú pháp: keyword, string, number, comment, function, builtin (`print`, `range`…), operator — tự chọn, **mỗi cặp chữ/nền đạt WCAG AA (≥ 4.5:1)**; comment cũng phải đạt AA (trẻ đọc comment gợi ý trong starter code). Ghi bảng màu vào `docs/design-system.md`.
- Cỡ chữ code 16px trên desktop/tablet, 15px trên điện thoại; `line-height` ~1.6.
- Focus: viền `accent` 3px quanh editor.
- Console "Kết quả chạy" cũng nền tối, chữ mono, cùng bảng màu; chữ chờ ("Bấm Chạy thử để xem…") màu nhạt nhưng vẫn đạt AA.
- Editor ở chế độ chỉ đọc (đang chạy) → giảm sáng nhẹ + con trỏ ẩn.

### Không được làm hỏng
- Giữ nguyên **logic**: runner, chấm bài, lưu nháp, ghi tiến độ, huy hiệu, `data-save-state`, gợi ý AI (kể cả câu nhắc không gõ tên thật). Chỉ đổi trình bày. Nếu cần tách component, tách phần trình bày (`ExerciseLayout`, `OutputConsole`, `ExerciseToolbar`), giữ state trong `ExercisePage`.
- Giữ mọi `data-testid` (`exercise-output`, `python-status`, `restored-draft`, `exercise-error`, `turtle-canvas`, `hint-*`, …) và **tên truy cập của nút** ("Chạy thử", "Nộp bài", …) vì e2e dựa vào chúng.
- Thứ tự tab hợp lý: đề bài → editor → nút → kết quả → gợi ý.

---

## 3. Kiểm tra (cho cả 3 phần)

1. `npm run check` xanh; `npm run test:e2e` xanh (Chromium + WebKit).
2. Thêm/sửa test:
   - Unit: `Button` các variant có tên truy cập và kích thước ≥ 44px (class).
   - E2E màn bài tập: ở viewport 1280×800, editor và khu kết quả **cùng nằm trong khung nhìn** (bounding box) và output nằm **bên phải** editor; ở 390×844, bấm "Chạy thử" thì khu kết quả vào khung nhìn.
   - E2E: bài turtle vẽ được hình ở bố cục mới.
3. Kiểm tra tương phản: viết script nhỏ (hoặc test) tính tỉ lệ tương phản cho các cặp màu token và màu cú pháp editor; tất cả chữ ≥ 4.5:1.
4. Chụp màn hình trước/sau (desktop 1440, tablet 820, điện thoại 390) cho màn bài tập và trang bản đồ, lưu vào `docs/design/screenshots/` và đưa vào mô tả PR.
5. Bundle: route bài tập vẫn trong ngân sách (`docs/tech-stack.md`); font không làm JS chính vượt ngân sách.
6. Gọi agent `privacy-reviewer` (font tự host, không request ngoài) trước khi báo xong.
7. Cập nhật `docs/roadmap-stage0.md` (S0-31, S0-32, S0-33) và Definition of Done.

## Hỏi lại người duy trì nếu
- Chọn phương án màu và font (bắt buộc hỏi trước khi áp toàn bộ).
- Muốn giữ chế độ tối cho cả khung trang.
