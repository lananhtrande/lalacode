---
name: next-task
description: Pick up the next roadmap item (S0-xx) from docs/roadmap-stage0.md, plan it, implement it in a small branch, and finish with the check skill. Use when asked to continue the project, start the next task, or work on a specific S0 item.
---

# Làm việc tiếp theo trong roadmap

1. Đọc `docs/roadmap-stage0.md`. Nếu có mục `[~]` → tiếp tục mục đó. Nếu người dùng nêu mã `S0-xx` → làm mục đó. Nếu không → mục `[ ]` đầu tiên mà các mục nó phụ thuộc đã xong.
2. Đọc tài liệu liên quan theo bảng "Đọc trước khi làm" trong `CLAUDE.md`.
3. Viết kế hoạch 3–7 dòng (file sửa, test thêm, rủi ro, có cần ADR không) và cho người dùng xem. Nếu việc đụng kiến trúc hoặc dữ liệu người dùng → chờ người dùng đồng ý.
4. `git switch -c <type>/S0-xx-<slug>`; đổi mục thành `[~]`.
5. Làm theo lát mỏng; viết test cùng lúc.
6. Chạy skill `check`.
7. Commit (Conventional Commits). Không push trừ khi người dùng yêu cầu.

Quy tắc: một mục roadmap mỗi lần. Phát hiện việc mới → thêm vào roadmap với mã mới, không làm lan man.
