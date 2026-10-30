# Lộ trình giai đoạn 0

Mục tiêu: 20 bài "Python khởi động" chạy hoàn toàn trên trình duyệt, beta với 100–300 trẻ, chi phí ≈ 5–10 USD/tháng.

Trạng thái: `[ ]` chưa làm · `[~]` đang làm · `[x]` xong. Claude cập nhật file này khi xong một mục.

## M1 — Nền móng (tuần 1–2)
- [x] S0-01 Monorepo npm workspaces, TS strict, ESLint/Prettier, Vitest, Playwright, script `check`
- [x] S0-01b CI: GitHub Actions `ci.yml` chạy `npm ci` + `npm run check` trên mỗi PR và push vào `main`; cache npm; Node từ `.nvmrc`; nhánh `main` được bảo vệ bằng ruleset `protect-main`
- [x] S0-02 `packages/content-schema` (zod) + `scripts/content-check.mjs`
- [x] S0-03 `scripts/content-verify.mjs` (chạy solution/starter bằng CPython) — thêm `content:verify` vào CI (setup-python 3.12)
- [x] S0-04 Khung app React: router, layout, i18n `vi.ts`, theme token, trang chủ tĩnh
- [x] S0-04b Walking skeleton lên AWS: Terraform tối thiểu (S3 private, CloudFront + OAC, response headers CSP/HSTS — **không cần COOP/COEP**, xem architecture §2, SPA fallback, cache `immutable` cho `/pyodide/*` và `/content/lessons/*`, cache ngắn cho `/content/index.json`, GitHub OIDC role) + workflow `deploy-web.yml`: build → upload `releases/<sha>/` → trỏ CloudFront → invalidate; preview cho PR
- [x] S0-05 Loader nội dung: build `content/` thành JSON bundle có hash

## M2 — Runner & chấm bài (tuần 2–4)
- [x] S0-06 Pyodide tự host + Web Worker + protocol có version
- [x] S0-07 Timeout & terminate/restart worker
- [x] S0-08 Grader Python cho 5 loại test
- [x] S0-09 Dịch lỗi Python sang tiếng Việt (`errors-vi.ts`) cho 15 lỗi phổ biến
- [x] S0-10 Module `turtle` vẽ lên canvas
- [x] S0-11 Màn bài tập: editor CodeMirror, chạy, chấm, kết quả từng test — thêm job Playwright e2e (Chromium + WebKit) chạy trên bản build, chặn deploy nếu đỏ

## M3 — Tiến độ & động lực (tuần 4–5)
- [x] S0-12 IndexedDB progress + migrate
- [x] S0-13 Bản đồ nhiệm vụ, streak, 6 huy hiệu đầu
- [x] S0-14 Mã tiến độ xuất/nhập — **không đưa `draftCode` vào mã chia sẻ** (code trẻ tự gõ, có thể vô tình chứa tên thật)
- [x] S0-15 Link báo cáo cho bố mẹ (`#fragment`) + trang báo cáo — chỉ hiện số liệu tiến độ, **không hiện code của trẻ**
- [x] S0-16 Nút xoá toàn bộ dữ liệu trên máy (`clearAllProgress()` đã có từ S0-12) — nhớ dọn luôn state đang hiển thị trên màn hình, và e2e: xoá → tải lại → sạch

## M4 — Gợi ý AI (tuần 5–6)
- [x] S0-17 Lambda `ai-hint`: validate, sanitize, prompt, gọi Claude qua Bedrock (IAM role, profile global)
- [x] S0-18 Rate limit DynamoDB + giới hạn toàn cục + công tắc tắt — Terraform thêm Lambda, Function URL sau CloudFront, DynamoDB, IAM `bedrock:InvokeModel`; workflow `deploy-ai-hint.yml`
- [x] S0-19 Panel gợi ý 3 mức trong UI + gợi ý tĩnh dự phòng — **bắt buộc có câu nhắc trẻ đừng gõ tên thật/địa chỉ vào code** trước khi gửi cho AI (bộ lọc không bắt được tên viết trơ trọi, xem privacy.md)
- [x] S0-20 Bộ eval prompt (30 case) và kết quả lưu trong repo

## M5 — Nội dung & phát hành (song song, tuần 3–8)
- [x] S0-21 10 bài đầu + bài tập (đã verify, đã review)
- [x] S0-22 10 bài tiếp — bài 11–20, khoá đủ 20 bài / 79 bài tập (đã verify, đã review). Bài 20 là dự án cuối, dài ~20 phút: ngoại lệ đã ghi trong `docs/content-format.md`.
- [x] S0-23 Trang giới thiệu cho phụ huynh + trang quyền riêng tư — `/gioi-thieu` và `/quyen-rieng-tu`, có test chốt hai lời thú nhận bắt buộc. Liên hệ: hello@teacherkit.help, hiện trên cả hai trang.
- [ ] S0-24 Hoàn thiện infra: budget alarm 20 USD, CloudWatch alarm lỗi/độ trễ Lambda, rà soát quyền IAM tối thiểu (bật model access Claude trong Bedrock — làm tay một lần)
- [ ] S0-25 Hoàn thiện CI/CD: **preview cho từng PR** (dời từ S0-04b), workflow `rollback-web.yml` (trỏ về `releases/<sha>` trước), `terraform plan` đăng vào PR, dọn preview cũ, Dependabot
- [ ] S0-26 Analytics gộp (sau khi chốt ADR 0005)
- [ ] S0-27 Beta kín 50–100 trẻ, thu phản hồi qua nhóm Zalo
- [x] S0-28 **Màn bài học** — `/bai-hoc/:id` đọc `lesson.md` bằng `react-markdown`, liệt kê bài tập kèm trạng thái, nút đi thẳng tới bài chưa xong. Video nhúng theo kiểu bấm-mới-tải (chưa bài nào có video). Trang chỉ đọc, không ghi IndexedDB.
- [x] S0-29 Bài 01 chỉ có 2 bài tập, dưới mức 3–5 của `docs/content-format.md` (phát hiện khi làm S0-28). Viết thêm 1–2 bài tập cho bài mở đầu.
- [x] S0-30 Lỗi race khi xong bài tập cuối (phát hiện khi làm S0-29): `ExercisePage.saveOutcome` chạy ngầm sau khi đã hiện lời khen, nên rời trang ngay thì `recordAttempt` đã ghi mà `markLessonCompleted` chưa chạy. Bản đồ vẫn hiện "Xong" (đếm từ bài tập) nhưng bài học không bao giờ có `completedAt`, mất huy hiệu "Trọn một bài học" và thiếu trong báo cáo phụ huynh. Làm e2e `progress.spec.ts` chập chờn trên ipad. Hướng sửa: suy ra bài học xong từ bài tập thay vì chỉ ghi lúc nộp, hoặc sửa bù khi mở bản đồ. Cần privacy-reviewer.
- [x] S0-31 **Design system riêng** (theo `docs/prompts/2026-10-30-ui-redesign.md`): token đặt tên theo vai trò, font tự host, `Button`/`IconButton`/`Card`/`AiPanel`, khung trang dạng sidebar. Dừng ở `/dev/design` để người duy trì chọn bảng màu và font. ADR 0008.
- [x] S0-32 **Màn bài tập 2 cột**: editor nền tối (theme tự viết, không thêm thư viện) bên trái, kết quả bên phải, mỗi cột tự cuộn; xếp dọc dưới 1024px. Dừng, chụp màn hình cho người duy trì xem.
- [ ] S0-33 **Áp design system cho các màn còn lại**: trang chủ, bản đồ, bài học, huy hiệu, báo cáo, tiến độ, giới thiệu, quyền riêng tư.

## Tiêu chí chuyển sang giai đoạn 1
- ≥ 70% trẻ hoàn thành bài 1; ≥ 40% quay lại sau 7 ngày; ≥ 30 phụ huynh xác nhận sẵn sàng trả phí.
