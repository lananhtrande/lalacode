# Kiểm thử

| Tầng | Công cụ | Chạy bằng | Bắt buộc khi |
| --- | --- | --- | --- |
| Unit (TS) | Vitest | `npm run test` | Mọi logic thuần: grader adapter, share-code, streak, sanitizeInput, buildPrompt |
| Component | Vitest + Testing Library | `npm run test` | Component có trạng thái (editor toolbar, hint panel) |
| Nội dung – schema | zod | `npm run content:check` | Mọi thay đổi `content/` |
| Nội dung – hành vi | CPython 3.12+ | `npm run content:verify` | Mọi thay đổi bài tập: solution pass, starter fail |
| Runner thật | Playwright + Pyodide | `npm run test:e2e -- runner` | Đổi runner, protocol, phiên bản Pyodide |
| E2E luồng chính | Playwright | `npm run test:e2e` | Đổi UI của bài học/bài tập/báo cáo |
| Lambda | Vitest, mock Bedrock Runtime & DynamoDB (`aws-sdk-client-mock`) | `npm run test -w services/ai-hint` | Mọi thay đổi `services/ai-hint` |
| Prompt AI | Bộ case cố định (`prompt.cases.json`) chạy thủ công với Bedrock thật (profile AWS có quyền) | `npm run eval:hints` | Đổi prompt hoặc model |

## Luồng E2E tối thiểu
1. Mở trang chủ → vào bài 1 → đọc → làm bài tập 1 sai → thấy thông báo lỗi tiếng Việt → sửa đúng → huy hiệu.
2. Vòng lặp vô hạn → hết giờ → thông báo → chạy lại được.
3. Xuất mã tiến độ → mở trình duyệt mới → nhập mã → tiến độ khôi phục.
4. Tạo link báo cáo → mở link → thấy đúng số bài đã xong; xác nhận không có request nào chứa dữ liệu tiến độ.
5. Gợi ý AI (mock) → hết lượt → hiện gợi ý tĩnh.

Chạy trên Chromium desktop và WebKit (iPhone 13, iPad).

## Quy tắc
- Không mock Pyodide trong test runner — dùng Pyodide thật; test UI khác có thể mock runner qua protocol.
- Test e2e số 4 phải **khẳng định** không có request mạng chứa mã tiến độ (chặn hồi quy về quyền riêng tư).
- Bug fix: viết test fail trước, sửa sau.
