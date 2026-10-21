# Lộ trình giai đoạn 0

Mục tiêu: 20 bài "Python khởi động" chạy hoàn toàn trên trình duyệt, beta với 100–300 trẻ, chi phí ≈ 5–10 USD/tháng.

Trạng thái: `[ ]` chưa làm · `[~]` đang làm · `[x]` xong. Claude cập nhật file này khi xong một mục.

## M1 — Nền móng (tuần 1–2)
- [ ] S0-01 Monorepo npm workspaces, TS strict, ESLint/Prettier, Vitest, Playwright, script `check`
- [ ] S0-02 `packages/content-schema` (zod) + `scripts/content-check.mjs`
- [ ] S0-03 `scripts/content-verify.mjs` (chạy solution/starter bằng CPython)
- [ ] S0-04 Khung app React: router, layout, i18n `vi.ts`, theme token, trang chủ tĩnh
- [ ] S0-05 Loader nội dung: build `content/` thành JSON bundle có hash

## M2 — Runner & chấm bài (tuần 2–4)
- [ ] S0-06 Pyodide tự host + Web Worker + protocol có version
- [ ] S0-07 Timeout & terminate/restart worker
- [ ] S0-08 Grader Python cho 5 loại test
- [ ] S0-09 Dịch lỗi Python sang tiếng Việt (`errors-vi.ts`) cho 15 lỗi phổ biến
- [ ] S0-10 Module `turtle` vẽ lên canvas
- [ ] S0-11 Màn bài tập: editor CodeMirror, chạy, chấm, kết quả từng test

## M3 — Tiến độ & động lực (tuần 4–5)
- [ ] S0-12 IndexedDB progress + migrate
- [ ] S0-13 Bản đồ nhiệm vụ, streak, 6 huy hiệu đầu
- [ ] S0-14 Mã tiến độ xuất/nhập
- [ ] S0-15 Link báo cáo cho bố mẹ (`#fragment`) + trang báo cáo
- [ ] S0-16 Nút xoá toàn bộ dữ liệu trên máy

## M4 — Gợi ý AI (tuần 5–6)
- [ ] S0-17 Lambda `ai-hint`: validate, sanitize, prompt, gọi Claude
- [ ] S0-18 Rate limit DynamoDB + giới hạn toàn cục + công tắc tắt
- [ ] S0-19 Panel gợi ý 3 mức trong UI + gợi ý tĩnh dự phòng
- [ ] S0-20 Bộ eval prompt (30 case) và kết quả lưu trong repo

## M5 — Nội dung & phát hành (song song, tuần 3–8)
- [ ] S0-21 10 bài đầu + bài tập (đã verify, đã review)
- [ ] S0-22 10 bài tiếp
- [ ] S0-23 Trang giới thiệu cho phụ huynh + trang quyền riêng tư
- [ ] S0-24 Terraform: S3, CloudFront (OAC, headers), Lambda, DynamoDB, budget alarm
- [ ] S0-25 GitHub Actions: check → build → e2e → deploy; OIDC
- [ ] S0-26 Analytics gộp (sau khi chốt ADR 0005)
- [ ] S0-27 Beta kín 50–100 trẻ, thu phản hồi qua nhóm Zalo

## Tiêu chí chuyển sang giai đoạn 1
- ≥ 70% trẻ hoàn thành bài 1; ≥ 40% quay lại sau 7 ngày; ≥ 30 phụ huynh xác nhận sẵn sàng trả phí.
