# CLAUDE.md — lalacode (giai đoạn 0)

Nền tảng học Python tiếng Việt cho học sinh 10–15 tuổi: bài giảng ngắn + bài tập chạy và chấm ngay trên trình duyệt (kiểu KodeKloud). Đây là **giai đoạn 0 – kiểm chứng**: web tĩnh, **không có server lưu dữ liệu người dùng**.

> Mọi tài liệu chi tiết nằm trong `docs/`. File này là luật; khi mâu thuẫn, file này thắng, rồi tới `docs/decisions/`.

## Đọc trước khi làm

| Khi bạn sắp… | Đọc |
| --- | --- |
| Viết hoặc sửa code bất kỳ | `docs/architecture.md`, `docs/conventions.md` |
| Thêm thư viện, đổi công nghệ | `docs/tech-stack.md`, rồi viết ADR mới trong `docs/decisions/` |
| Viết bài học / bài tập | `docs/content-format.md` (hoặc dùng skill `new-lesson`) |
| Chạm vào bất cứ thứ gì liên quan dữ liệu, log, analytics, AI | `docs/privacy.md` — **bắt buộc** |
| Viết test, chuẩn bị commit | `docs/testing.md`, `docs/workflow.md` |
| Chọn việc tiếp theo | `docs/roadmap-stage0.md` |

## Luật không được phá (giai đoạn 0)

1. **Không lưu dữ liệu cá nhân trên server.** Không tài khoản, không form thu tên/email/SĐT của trẻ, không cookie theo dõi, không log nội dung request. Tiến độ học chỉ ở IndexedDB trên máy người dùng. Người dùng là trẻ em — xem `docs/privacy.md`.
2. **Code của học sinh chỉ chạy trong Web Worker Pyodide**, có timeout và có thể `terminate()`. Không bao giờ `eval` code học sinh trên main thread hay trên server.
3. **AI proxy không trạng thái:** chỉ nhận `{exerciseId, code, error, hintLevel, token}`; không ghi log body; không gửi gì nhận dạng được trẻ tới API AI. API key chỉ nằm ở server (Secrets Manager), không bao giờ ở frontend hay trong repo.
4. **AI không đưa lời giải đầy đủ.** Gợi ý theo 3 mức (nhẹ → chỉ dòng lỗi → ví dụ tương tự). Prompt hệ thống nằm ở `services/ai-hint/src/prompt.ts` và có test.
5. **Nội dung là dữ liệu.** Bài học và bài tập là file trong `content/`, kiểm tra bằng schema (`npm run content:check`). Không viết cứng nội dung bài trong component.
6. **Mọi lời giải mẫu phải pass test ẩn, mọi starter code phải fail** — kiểm tra bằng `npm run content:verify` (chạy CPython thật).
7. **UI tiếng Việt, ngôn ngữ thân thiện với trẻ.** Không thuật ngữ khó khi chưa giải thích; thông báo lỗi không mắng trẻ.
8. **Không thêm dependency mới** khi chưa ghi lý do trong PR/commit; dependency lớn (>50 kB gzip) hoặc thay đổi kiến trúc cần ADR.
9. **Không commit bí mật.** `.env*` (trừ `.env.example`), khoá AWS, API key bị hook chặn — đừng tìm cách lách.

## Lệnh thường dùng

```bash
npm install            # cài dependency (Node 22 LTS)
npm run dev            # Vite dev server
npm run check          # lint + typecheck + unit test + content:check — chạy trước khi báo "xong"
npm run test:e2e       # Playwright (Chromium + WebKit mobile)
npm run content:check  # validate JSON bài học theo schema
npm run content:verify # chạy lời giải mẫu & starter bằng CPython (cần python3 ≥ 3.12)
npm run build          # build tĩnh vào dist/
```

Infra: `infra/` (Terraform). **Không chạy `terraform apply`** — chỉ `plan`, người dùng tự apply.

## Cách làm việc

- Việc nhiều bước: lập kế hoạch ngắn → làm từng bước nhỏ → `npm run check` → tóm tắt. Không làm nhiều tính năng trong một commit.
- Trước khi báo hoàn thành: `npm run check` xanh; nếu đụng UI thì chạy e2e liên quan; nếu đụng `content/` thì `content:verify`.
- Khi không chắc về quyết định sản phẩm (nội dung sư phạm, giá, dữ liệu) — **hỏi**, đừng tự quyết.
- Commit theo Conventional Commits, tiếng Anh, ví dụ `feat(runner): add 5s timeout to pyodide worker`.
- Sau khi sửa bất cứ thứ gì về dữ liệu/AI/analytics, gọi agent `privacy-reviewer`. Sau khi viết bài học, gọi agent `content-reviewer`.

## Cấu trúc thư mục (đích)

```
apps/web/              # React 19 + Vite + TS (frontend tĩnh)
  src/runner/          # Pyodide worker, protocol, grader
  src/progress/        # IndexedDB, export/import, report link
  src/features/        # lesson, exercise, map, badges, report
packages/content-schema/  # zod schema + types dùng chung
content/courses/       # bài học & bài tập (JSON + Markdown)
services/ai-hint/      # Lambda proxy gợi ý AI (TS, Node 22)
infra/                 # Terraform: S3, CloudFront, Lambda, DynamoDB
scripts/               # content:check, content:verify, build helpers
docs/                  # tài liệu dự án
.claude/               # harness cho Claude Code
```
