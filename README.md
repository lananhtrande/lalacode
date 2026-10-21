# lalacode

Nền tảng học Python tiếng Việt cho học sinh 10–15 tuổi — bài học ngắn, code chạy và chấm ngay trên trình duyệt, gợi ý AI như một gia sư.

**Trạng thái:** giai đoạn 0 (kiểm chứng) — web tĩnh, không lưu dữ liệu người dùng trên server.

## Bắt đầu

Yêu cầu: Node.js 22 LTS, Python 3.12+ (để chạy `content:verify`).

```bash
npm install
npm run dev
npm run check
```

## Tài liệu
- `CLAUDE.md` — luật làm việc (cho cả người và Claude Code)
- `docs/architecture.md` — kiến trúc giai đoạn 0
- `docs/tech-stack.md` — công nghệ và lý do
- `docs/workflow.md` — quy trình, Definition of Done
- `docs/conventions.md` — quy ước code
- `docs/content-format.md` — định dạng bài học, nguyên tắc sư phạm
- `docs/privacy.md` — dữ liệu & quyền riêng tư
- `docs/testing.md` — chiến lược kiểm thử
- `docs/roadmap-stage0.md` — danh sách việc
- `docs/decisions/` — ADR

## Làm việc với Claude Code
Thư mục `.claude/` chứa harness: quyền, hooks chặn bí mật và chạy format/lint sau mỗi lần sửa, agent review (nội dung, quyền riêng tư) và skill (`new-lesson`, `check`, `next-task`). Xem `.claude/README.md`.
