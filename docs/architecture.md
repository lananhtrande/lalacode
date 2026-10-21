# Kiến trúc — giai đoạn 0

## Mục tiêu giai đoạn 0

Trả lời 3 câu hỏi với chi phí ≈ 5–10 USD/tháng, **không lưu dữ liệu cá nhân trên server**:

1. Trẻ có học hết 10 bài đầu không? (tỉ lệ hoàn thành)
2. Trẻ có quay lại tuần sau không? (tỉ lệ quay lại, đo gộp)
3. Bao nhiêu phụ huynh nói sẽ trả 99.000 đ/tháng? (đo qua nhóm Zalo/Facebook, ngoài web)

## Sơ đồ

```
                    ┌──────────────────────── Trình duyệt của trẻ ────────────────────────┐
                    │  React app (tĩnh)                                                     │
                    │   ├─ Lesson viewer (Markdown + video)                                  │
                    │   ├─ Editor (CodeMirror 6)                                             │
                    │   ├─ Runner ──postMessage──► Web Worker: Pyodide (CPython WASM)        │
                    │   │                           ├─ chạy code, bắt stdout/stderr/turtle   │
                    │   │                           └─ chạy test ẩn → kết quả chấm           │
                    │   ├─ Progress store (IndexedDB) ─ export/import "mã tiến độ"           │
                    │   └─ Report link: tiến độ nén trong #fragment (không gửi lên server)   │
                    └───────┬──────────────────────────────────────────────┬────────────────┘
                            │ GET tĩnh (HTML/JS/WASM/JSON/video)           │ POST /hint (không PII)
                            ▼                                              ▼
              CloudFront (edge HN/HCM) ◄── S3 Singapore          Lambda ai-hint (Function URL
                                                                  qua CloudFront) ──► Claude API
                                                                  └─ DynamoDB: bộ đếm rate-limit
                                                                     theo token ẩn danh (TTL 48h)
```

## Thành phần

### 1. Frontend tĩnh (`apps/web`)
- SPA build bằng Vite, deploy lên S3 + CloudFront. Route phía client.
- Trang: Trang chủ · Bản đồ nhiệm vụ · Bài học · Bài tập · Huy hiệu · Báo cáo cho bố mẹ · Giới thiệu & quyền riêng tư.
- Responsive: điện thoại (≥360 px), tablet, laptop. Trẻ có thể dùng tablet là chính.

### 2. Runner (`apps/web/src/runner`)
- **Một Web Worker riêng** giữ Pyodide; main thread chỉ gửi/nhận message theo protocol có kiểu (`protocol.ts`).
- Pyodide **tự host** trên CloudFront (không dùng jsDelivr) — nhanh hơn ở Việt Nam, kiểm soát phiên bản.
- Tải ngầm (`preload`) khi trẻ mở bài học, trước khi tới phần bài tập.
- Mỗi lần chạy: timeout mặc định 5 s (bài có vòng lặp nặng tối đa 10 s). Hết giờ → `worker.terminate()` → tạo worker mới → báo trẻ "Code chạy lâu quá, có thể có vòng lặp vô hạn".
- `input()` → hộp nhập trong UI (qua `SharedArrayBuffer` + Atomics nếu bật COOP/COEP, nếu không thì cung cấp input dựng sẵn trong đề).
- `turtle` → module Python tự viết vẽ lên `OffscreenCanvas`/lệnh vẽ gửi về main thread.
- Grader: chạy code học sinh trong namespace riêng, rồi chạy test ẩn (assert theo dạng khai báo trong `content-format.md`), trả `{passed, results[], stdout, error}`.
- Lỗi Python → chuyển traceback sang thông báo tiếng Việt thân thiện (bảng ánh xạ `errors-vi.ts`), giữ dòng lỗi.

### 3. Progress (`apps/web/src/progress`)
- IndexedDB (thư viện `idb`), schema có `version` để migrate.
- Lưu: bài đã xong, số lần chạy, thời điểm, streak, huy hiệu, code nháp gần nhất mỗi bài. **Không** lưu tên thật; "biệt danh" (tuỳ chọn) chỉ ở máy.
- **Mã tiến độ:** JSON → nén (`CompressionStream` deflate) → base64url; xuất/nhập để đổi máy.
- **Link báo cáo cho bố mẹ:** `https://<domain>/bao-cao#<mã>` — phần sau `#` không bao giờ gửi lên server. Trang báo cáo giải mã và hiển thị.
- Schema progress được thiết kế trùng với bảng PostgreSQL ở giai đoạn 1 để sau này "đồng bộ" một chạm.

### 4. AI hint proxy (`services/ai-hint`)
- AWS Lambda (Node 22, TS), gọi qua CloudFront path `/api/hint` (cùng origin → không cần CORS rộng).
- Input: `{exerciseId, code ≤ 4 kB, error ≤ 2 kB, hintLevel 1–3, token}`. Server tự lấy đề bài theo `exerciseId` từ bundle nội dung — **không tin đề bài do client gửi**.
- Model: `claude-haiku-5-5`, `max_tokens` thấp (~400). Prompt hệ thống: không đưa lời giải đầy đủ, tiếng Việt cho trẻ 10–15 tuổi, từ chối chủ đề ngoài bài.
- Rate limit: `token` = UUID ngẫu nhiên tạo trên máy (không liên kết danh tính). Lambda lưu `sha256(token)` + ngày trong DynamoDB, TTL 48 h, ~5 lượt/ngày/token, cộng giới hạn toàn cục/ngày để chặn chi phí.
- Không ghi log body request/response. Chỉ log: thời gian, mã kết quả, độ trễ, số token AI.
- Có công tắc tắt AI (biến môi trường) → frontend hiển thị gợi ý tĩnh viết sẵn trong bài.

### 5. Analytics gộp (chưa chốt — xem ADR 0005)
- Chỉ sự kiện gộp: `lesson_started`, `lesson_completed`, `exercise_passed`, `returned_after_7d`. Không ID người dùng, không cookie, không IP lưu trữ.

### 6. Video
- Bài miễn phí: nhúng YouTube chế độ `youtube-nocookie.com`, video đánh dấu "dành cho trẻ em".
- Dự phòng: HLS trên S3 + CloudFront (MediaConvert) nếu cần bỏ YouTube.

### 7. Infra (`infra/`, Terraform)
- S3 (private) + CloudFront (OAC), response headers: CSP chặt, COOP/COEP nếu dùng SharedArrayBuffer, HSTS.
- Lambda + Function URL (auth IAM, chỉ CloudFront gọi được qua OAC), DynamoDB on-demand, Secrets Manager cho API key, budget alarm 20 USD.
- CI/CD: GitHub Actions, OIDC vào AWS (không có access key dài hạn).

## Những gì KHÔNG có ở giai đoạn 0

Tài khoản, thanh toán, bảng xếp hạng chung, email báo cáo tự động, database server, lớp học cho giáo viên. Tất cả để giai đoạn 1 (VPS tại Việt Nam + PostgreSQL) — xem `roadmap-stage0.md`.

## Chuẩn bị cho giai đoạn sau

| Quyết định bây giờ | Để sau này |
| --- | --- |
| Nội dung là JSON có `id` ổn định, có `authorId` | Giáo viên tạo khoá/bài tập (marketplace) |
| Progress schema có version, khớp bảng SQL | Đồng bộ lên server khi có tài khoản |
| Runner tách khỏi UI qua protocol | Tái dùng cho trang tạo bài tập của giáo viên |
| AI proxy là service độc lập, đóng container được | Chuyển sang EKS/VPS mà không viết lại |
