# Harness Claude Code

| Thành phần | File | Tác dụng |
| --- | --- | --- |
| Luật dự án | `../CLAUDE.md` | Claude đọc mỗi phiên |
| Quyền | `settings.json` → `permissions` | Cho phép lệnh an toàn (npm run, git commit, terraform plan); hỏi trước khi cài package mới, push, gọi AWS; cấm đọc `.env`, terraform apply, force-push |
| Hook SessionStart | `hooks/session-start.mjs` | Báo giai đoạn hiện tại + mục roadmap tiếp theo |
| Hook chặn file | `hooks/guard-files.mjs` | Chặn ghi `.env`/khoá/tfstate, chặn API key trong nội dung, chặn tracker/cookie/CDN ngoài/form thu thông tin cá nhân trong code ứng dụng |
| Hook chặn lệnh | `hooks/guard-bash.mjs` | Lớp thứ hai sau permissions: terraform apply, force-push, push lên main, đọc `.env`, xoá nguy hiểm, AWS phá huỷ |
| Hook sau khi sửa | `hooks/post-edit.mjs` | Kiểm JSON, chạy Prettier + ESLint, `content:check` khi sửa nội dung; nhắc gọi agent review |
| Agent | `agents/privacy-reviewer.md` | Review dữ liệu/AI/log/request theo `docs/privacy.md` |
| Agent | `agents/content-reviewer.md` | Review bài học: đúng kỹ thuật, sư phạm, giọng văn |
| Skill | `skills/new-lesson` | Tạo bài học + bài tập đúng định dạng, kiểm tra, review |
| Skill | `skills/check` | Kiểm tra toàn bộ trước khi báo xong |
| Skill | `skills/next-task` | Lấy và làm mục roadmap tiếp theo |

Hooks viết bằng Node thuần (không dependency), chạy được cả trước `npm install`; khi chưa có `node_modules`, bước format/lint tự bỏ qua.

Cài đặt cá nhân (không commit): `.claude/settings.local.json`.
