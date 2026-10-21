---
name: check
description: Run the full pre-completion verification (lint, typecheck, unit tests, content checks, relevant e2e) and the right reviewer agents, then report against the Definition of Done. Use before saying a task is finished or before committing.
---

# Kiểm tra trước khi báo xong

1. `git status` và `git diff --stat` — liệt kê vùng đã thay đổi.
2. `npm run check`. Nếu đỏ: sửa, chạy lại. Không báo xong khi còn đỏ.
3. Theo vùng thay đổi:
   | Vùng | Thêm |
   | --- | --- |
   | `content/**` | `npm run content:verify` + agent `content-reviewer` |
   | `apps/web/src/runner/**` | `npm run test:e2e -- runner` |
   | UI (`apps/web/src/features/**`, `app/**`) | e2e spec liên quan, chụp màn hình viewport 360×740 và 820×1180 |
   | `progress/**`, `runner/**`, `services/ai-hint/**`, `infra/**`, request mạng mới | agent `privacy-reviewer` |
   | `infra/**` | `terraform fmt -check && terraform validate && terraform plan` (không apply) |
4. Đối chiếu Definition of Done trong `docs/workflow.md`; đánh dấu từng mục.
5. Nếu xong một mục roadmap: đổi `[ ]`/`[~]` → `[x]` trong `docs/roadmap-stage0.md`.
6. Báo cáo ngắn: đã làm gì, kết quả kiểm tra, việc còn lại/rủi ro. Đề xuất commit message theo Conventional Commits.
