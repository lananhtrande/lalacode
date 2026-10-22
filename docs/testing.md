# Kiểm thử

| Tầng | Công cụ | Chạy bằng | Bắt buộc khi |
| --- | --- | --- | --- |
| Unit (TS) | Vitest | `npm run test` | Mọi logic thuần: grader adapter, share-code, streak, sanitizeInput, buildPrompt |
| Component | Vitest + Testing Library | `npm run test` | Component có trạng thái (editor toolbar, hint panel) |
| Nội dung – schema | zod | `npm run content:check` | Mọi thay đổi `content/` |
| Nội dung – hành vi | CPython 3.12+ (`scripts/grader.py`) | `npm run content:verify` | Mọi thay đổi bài tập: solution pass, starter fail |
| Runner thật | Playwright + Pyodide | `npm run test:e2e -- runner` | Đổi runner, protocol, phiên bản Pyodide |
| E2E luồng chính | Playwright | `npm run test:e2e` | Đổi UI của bài học/bài tập/báo cáo |
| Lambda | Vitest, mock Bedrock Runtime & DynamoDB (`aws-sdk-client-mock`) | `npm run test -w services/ai-hint` | Mọi thay đổi `services/ai-hint` |
| Prompt AI | Bộ case cố định (`prompt.cases.json`) chạy thủ công với Bedrock thật (profile AWS có quyền) | `npm run eval:hints` | Đổi prompt hoặc model |

## Chấm bài: một bản cài đặt, hai nơi chạy

`apps/web/src/runner/grader.py` là **một bản cài đặt, hai nơi chạy**:

- `npm run content:verify` gọi nó bằng **CPython** (JSON vào ở stdin, JSON ra ở stdout qua `main()`).
- Worker gọi `grade_json(...)` của nó trong **Pyodide** để chấm bài của trẻ.

Vì vậy grader chỉ dùng thư viện chuẩn, mỗi test chạy trong một namespace mới, và `stdin` của test được nạp sẵn cho `input()`.

**Bẫy đã gặp:** `pyodide.runPython(source)` đặt `__name__ = "__main__"`, nên nạp thẳng grader.py sẽ chạy luôn `main()` và ngồi đợi JSON ở stdin → treo worker. Worker phải `exec` nguồn vào một module riêng (xem `worker.ts`). Lỗi này chỉ lộ ra khi chạy Pyodide thật, không unit test nào bắt được.

Test cho grader nằm ở `scripts/grader.test.mjs` (Vitest gọi python thật, tự bỏ qua nếu máy không có CPython 3.12+) và `e2e/runner.spec.ts` (chấm đủ 5 loại test trong Pyodide thật).

## Dịch lỗi Python

`apps/web/src/runner/errors-vi.ts` được test hai tầng:

1. **Unit** — chạy lại trên `pyodide-errors.fixture.json`, là traceback thật ghi từ Pyodide. Có test khẳng định **không lỗi nào trong fixture rơi vào câu chung**, và không câu nào dùng từ mắng trẻ.
2. **E2E** — chạy thật 20 đoạn code sai trong Pyodide rồi kiểm tra UI hiện câu tiếng Việt riêng, không lọt `Traceback` hay hướng dẫn `micropip` tiếng Anh.

Nâng phiên bản Pyodide thì chạy lại bộ e2e này: nếu Pyodide đổi cách viết thông báo, test đỏ ngay. Muốn cập nhật fixture thì chạy lại các đoạn code trong e2e và ghi `error.message` ra file.

## Luồng E2E tối thiểu
1. Mở trang chủ → vào bài 1 → đọc → làm bài tập 1 sai → thấy thông báo lỗi tiếng Việt → sửa đúng → huy hiệu.
2. Vòng lặp vô hạn → hết giờ → thông báo → chạy lại được.
3. Xuất mã tiến độ → mở trình duyệt mới → nhập mã → tiến độ khôi phục. ✅ `e2e/progress-code.spec.ts` (dùng context mới của Playwright làm "máy khác").
4. Tạo link báo cáo → mở link → thấy đúng số bài đã xong; xác nhận không có request nào chứa dữ liệu tiến độ.
5. Gợi ý AI (mock) → hết lượt → hiện gợi ý tĩnh.

Chạy trên Chromium desktop và WebKit (iPhone 13, iPad).

## Chạy e2e trên bản build

- `npm run test:e2e` — dev server, nhanh, dùng khi đang làm.
- `PLAYWRIGHT_PREVIEW=1 npm run test:e2e` — **build rồi chạy trên bản phát hành thật** (`vite preview`). CI dùng chế độ này ở job `e2e`, chạy sau khi `check` xanh; đỏ thì chặn deploy.
- `npm run test:e2e:csp` — build rồi chạy sau một server trả **đúng header của CloudFront**, đọc từ `infra/csp.txt`. Chạy cái này mỗi khi đổi CSP hoặc đổi cách nạp Pyodide/worker: CSP sai thì trẻ chỉ thấy màn hình trắng, và lỗi đó không lộ ra ở dev server.
- Trang `/thu-runner` chỉ có ở dev nên `runner.spec.ts` tự bỏ qua ở chế độ preview. Luồng của trẻ (`smoke.spec.ts`, `exercise.spec.ts`) chạy ở cả hai chế độ.

## Quy tắc
- Không mock Pyodide trong test runner — dùng Pyodide thật; test UI khác có thể mock runner qua protocol.
- Test e2e số 4 phải **khẳng định** không có request mạng chứa mã tiến độ (chặn hồi quy về quyền riêng tư).
- Bug fix: viết test fail trước, sửa sau.
