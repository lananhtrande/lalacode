# Lộ trình giai đoạn 0

Mục tiêu: 20 bài "Python khởi động" chạy hoàn toàn trên trình duyệt, beta với 100–300 trẻ, chi phí ≈ 5–10 USD/tháng.

Trạng thái: `[ ]` chưa làm · `[~]` đang làm · `[x]` xong. Claude cập nhật file này khi xong một mục.

## M1 — Nền móng (tuần 1–2)
- [x] S0-01 Monorepo npm workspaces, TS strict, ESLint/Prettier, Vitest, Playwright, script `check`
- [x] S0-01b CI: GitHub Actions `ci.yml` chạy `npm ci` + `npm run check` trên mỗi PR và push vào `main`; cache npm; Node từ `.nvmrc`; nhánh `main` được bảo vệ bằng ruleset `protect-main`
- [x] S0-02 `packages/content-schema` (zod) + `scripts/content-check.mjs`
- [x] S0-03 `scripts/content-verify.mjs` (chạy solution/starter bằng CPython) — thêm `content:verify` vào CI (setup-python 3.12)
- [x] S0-04 Khung app React: router, layout, i18n `vi.ts`, theme token, trang chủ tĩnh
- [ ] S0-04b Walking skeleton lên AWS: Terraform tối thiểu (S3 private, CloudFront + OAC, response headers CSP/HSTS — **không cần COOP/COEP**, xem architecture §2, SPA fallback, cache `immutable` cho `/pyodide/*` và `/content/lessons/*`, cache ngắn cho `/content/index.json`, GitHub OIDC role) + workflow `deploy-web.yml`: build → upload `releases/<sha>/` → trỏ CloudFront → invalidate; preview cho PR
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
- [ ] S0-14 Mã tiến độ xuất/nhập — **không đưa `draftCode` vào mã chia sẻ** (code trẻ tự gõ, có thể vô tình chứa tên thật)
- [ ] S0-15 Link báo cáo cho bố mẹ (`#fragment`) + trang báo cáo — chỉ hiện số liệu tiến độ, **không hiện code của trẻ**
- [ ] S0-16 Nút xoá toàn bộ dữ liệu trên máy (`clearAllProgress()` đã có từ S0-12) — nhớ dọn luôn state đang hiển thị trên màn hình, và e2e: xoá → tải lại → sạch

## M4 — Gợi ý AI (tuần 5–6)
- [ ] S0-17 Lambda `ai-hint`: validate, sanitize, prompt, gọi Claude qua Bedrock (IAM role, profile global)
- [ ] S0-18 Rate limit DynamoDB + giới hạn toàn cục + công tắc tắt — Terraform thêm Lambda, Function URL sau CloudFront, DynamoDB, IAM `bedrock:InvokeModel`; workflow `deploy-ai-hint.yml`
- [ ] S0-19 Panel gợi ý 3 mức trong UI + gợi ý tĩnh dự phòng
- [ ] S0-20 Bộ eval prompt (30 case) và kết quả lưu trong repo

## M5 — Nội dung & phát hành (song song, tuần 3–8)
- [ ] S0-21 10 bài đầu + bài tập (đã verify, đã review)
- [ ] S0-22 10 bài tiếp
- [ ] S0-23 Trang giới thiệu cho phụ huynh + trang quyền riêng tư
- [ ] S0-24 Hoàn thiện infra: budget alarm 20 USD, CloudWatch alarm lỗi/độ trễ Lambda, rà soát quyền IAM tối thiểu (bật model access Claude trong Bedrock — làm tay một lần)
- [ ] S0-25 Hoàn thiện CI/CD: workflow `rollback-web.yml` (trỏ về `releases/<sha>` trước), `terraform plan` đăng vào PR, dọn preview cũ, Dependabot
- [ ] S0-26 Analytics gộp (sau khi chốt ADR 0005)
- [ ] S0-27 Beta kín 50–100 trẻ, thu phản hồi qua nhóm Zalo

## Tiêu chí chuyển sang giai đoạn 1
- ≥ 70% trẻ hoàn thành bài 1; ≥ 40% quay lại sau 7 ngày; ≥ 30 phụ huynh xác nhận sẵn sàng trả phí.
