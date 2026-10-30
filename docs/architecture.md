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
                                                                  qua CloudFront) ──► Bedrock (Claude, global)
                                                                  └─ DynamoDB: bộ đếm rate-limit
                                                                     theo token ẩn danh (TTL 48h)
```

## Thành phần

### 1. Frontend tĩnh (`apps/web`)
- SPA build bằng Vite, deploy lên S3 + CloudFront. Route phía client.
- Trang: Trang chủ · Bản đồ nhiệm vụ · Bài học · Bài tập · Huy hiệu · Báo cáo cho bố mẹ · Giới thiệu & quyền riêng tư.
- Đường dẫn bằng tiếng Việt, để trẻ và bố mẹ đọc hiểu được:

  | Đường dẫn | Trang |
  | --- | --- |
  | `/` | Trang chủ |
  | `/ban-do` | Bản đồ nhiệm vụ |
  | `/bai-hoc/:lessonId` | Bài học |
  | `/bai-tap/:exerciseId` | Bài tập |
  | `/huy-hieu` | Huy hiệu |
  | `/bao-cao` | Báo cáo cho bố mẹ (đọc `#fragment`) |
  | `/gioi-thieu` | Giới thiệu & quyền riêng tư |

  Trang chủ nằm trong bundle chính; các trang khác lazy-load. Hosting phải trả `index.html` cho mọi đường dẫn (SPA fallback).
- Responsive: điện thoại (≥360 px), tablet, laptop. Trẻ có thể dùng tablet là chính.

### 2. Runner (`apps/web/src/runner`)
- **Một Web Worker riêng** giữ Pyodide; main thread chỉ gửi/nhận message theo protocol có kiểu (`protocol.ts`).
- Pyodide **tự host** trên CloudFront (không dùng jsDelivr) — nhanh hơn ở Việt Nam, kiểm soát phiên bản.
- `scripts/copy-pyodide.mjs` chép bản đã ghim từ `node_modules` vào `apps/web/public/pyodide/<version>/` (≈13 MB, 5 file: `pyodide.mjs`, `pyodide.asm.mjs`, `pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json`). Đường dẫn có số phiên bản → cache `immutable`. Script sẽ dừng build nếu phiên bản trong `node_modules` lệch với `PYODIDE_VERSION` trong code.
- Giao thức có `PROTOCOL_VERSION` (hiện là 1: `init`, `run`, `cancel`; `grade` thêm ở S0-08 kèm tăng phiên bản). Main thread chỉ nhận message hợp lệ (`isRunnerResponse`).
- Trang `/thu-runner` **chỉ có ở chế độ dev** để thử runner bằng tay và cho e2e chạy Pyodide thật.
- Tải ngầm (`preload`) khi trẻ mở bài học, trước khi tới phần bài tập.
- Mỗi lần chạy: timeout mặc định 5 s (bài có vòng lặp nặng tối đa 10 s). Hết giờ → `worker.terminate()` → tạo worker mới ngay → báo trẻ "Code chạy lâu quá, có thể em viết vòng lặp không bao giờ dừng".
- **Đồng hồ chỉ chạy khi code của trẻ thật sự chạy.** Worker gửi `started` sau khi Pyodide sẵn sàng; main thread bấm giờ từ đó. Việc nạp Pyodide (≈13 MB WASM, máy yếu mất hàng chục giây) có đồng hồ riêng 60 s. Nếu không tách, lần chạy đầu sau mỗi lần dựng lại worker sẽ bị tính oan là "vòng lặp vô hạn" — đã gặp thật trên WebKit khi chạy e2e.
- Huỷ (`cancel`) cũng đi qua đúng đường đó: `terminate()` + dựng lại, vì worker đang kẹt không trả lời message.
- `input()` → **input dựng sẵn trong đề** (`stdin` của từng test), nạp vào Pyodide bằng `setStdin`. Cách này **không cần `SharedArrayBuffer`**, nên **không phải bật COOP/COEP** — đỡ rắc rối và không chặn nhúng video YouTube. Hộp nhập tương tác (cần Atomics) để sau, nếu thật sự cần.
- `turtle` → **module Python tự viết** (`apps/web/src/runner/turtle.py`): nó **ghi lại lệnh vẽ** (`line`, `dot`, `fill`, `turtle`, `clear`) rồi gửi về main thread qua message `drawing`; `turtle-canvas.ts` vẽ lên `<canvas>`. Không vẽ trực tiếp trong worker nên không cần `OffscreenCanvas`.
  - Rùa được cài vào `sys.modules['turtle']` ngay sau khi nạp Pyodide, nên `import turtle` trong bài của trẻ dùng đúng rùa này.
  - **`content:verify` cũng cần rùa này**: CPython thật `import turtle` sẽ hỏng vì thiếu `_tkinter` (không có màn hình). `scripts/lib/run-grader.mjs` gửi kèm nguồn `turtle.py`, `grader.py` cài vào `sys.modules` trước khi chạy code.
  - Code lỗi giữa chừng vẫn gửi phần đã vẽ được, để trẻ thấy hình dừng ở đâu.
  - Giới hạn 20.000 lệnh vẽ cho một lần chạy, tránh vòng lặp làm phình bộ nhớ.
- Grader: `apps/web/src/runner/grader.py` — **cùng một file** mà `content:verify` chạy bằng CPython. Mỗi test chạy code học sinh trong namespace mới rồi kiểm tra theo khai báo trong `content-format.md`, trả `{passed, results[]}` với `message` tiếng Việt của người viết bài và `detail` kỹ thuật ("cần ... nhận ...").
- Worker `exec` grader vào một module riêng thay vì `runPython` thẳng: `runPython` đặt `__name__ = "__main__"` nên khối CLI của grader sẽ chạy và treo worker.
- Lỗi Python → thông báo tiếng Việt thân thiện (`errors-vi.ts`), **giữ số dòng** của code trẻ và giữ nguyên văn dòng lỗi (để gỡ rối và để gửi cho dịch vụ gợi ý AI).
  - Bảng dịch viết dựa trên **traceback thật** lấy từ Pyodide, lưu ở `pyodide-errors.fixture.json` — đoán theo trí nhớ rất dễ lệch với chuỗi thật (Python 3.14 còn thêm `Did you mean: 'print'?`, mình dịch luôn gợi ý đó).
  - Phủ 20 lỗi hay gặp nhất của người mới (NameError, SyntaxError, IndentationError, TypeError, ValueError, ZeroDivisionError, IndexError, KeyError, AttributeError, ModuleNotFoundError, EOFError, RecursionError, UnboundLocalError…), có câu chung cho lỗi lạ.
  - Chỉ lấy số dòng từ khung code của trẻ (`<exec>` hoặc `bai-lam.py`), bỏ qua khung nội bộ của Pyodide.

### 2b. Bundle nội dung (`scripts/content-build.mjs` → `apps/web/public/content/`)

- `content/` được build thành JSON tĩnh trước khi Vite chạy (`npm run content:build`, tự chạy trong script `dev` và `build` của `apps/web`).
- `index.json` — tên cố định, cache ngắn: danh sách khoá và tóm tắt bài (tiêu đề, số phút, số bài tập, trạng thái) kèm **đường dẫn file bài học**.
- `lessons/<lessonId>.<hash8>.json` — tên có hash nội dung nên cache `immutable` được: bài học + Markdown + bài tập.
- **Không gửi `solution` xuống trình duyệt.** Trẻ mở devtools là thấy đáp án. Test thì vẫn gửi, vì việc chấm chạy ngay trong máy; "ẩn" ở đây nghĩa là không hiển thị, không phải bí mật tuyệt đối.
- Build từ chối chạy nếu nội dung sai schema — bundle là thứ trẻ tải về.
- Loader ở `apps/web/src/content/loader.ts`: tải một lần rồi nhớ trong bộ nhớ, chỉ dùng `import type` từ `@lalakode/content-schema` nên zod không đi vào bundle trình duyệt.

### 2c. Màn bài tập (`apps/web/src/features/exercise`)

- Editor: CodeMirror 6 **không dùng `basicSetup`** — chỉ số dòng, hoàn tác, thụt dòng, tô màu Python (ADR 0007 về ngân sách bundle).
- Hai nút: *Chạy thử* (xem chương trình in gì) và *Nộp bài* (chấm bằng test ẩn). Đang chạy thì khoá ô code và hiện nút *Dừng*.
- Pyodide được nạp ngầm ngay khi mở bài tập, có dòng trạng thái "Đang chuẩn bị Python…" → "Python sẵn sàng".
- Kết quả từng test: **icon + chữ**, không chỉ dựa vào màu; hiện câu tiếng Việt của người viết bài, kèm chi tiết "cần … nhận …".
- Lỗi: câu tiếng Việt + số dòng, lỗi gốc giấu trong `<details>` để trẻ nào tò mò thì xem.
- Gợi ý viết sẵn mở dần từng mức (gợi ý AI là S0-19).
- Tiến độ chưa lưu ở bước này — IndexedDB là S0-12.

### 3. Progress (`apps/web/src/progress`)
- IndexedDB (thư viện `idb`), schema có `version` để migrate. Ba store: `exercises` (khoá `exerciseId`, có index theo bài học), `lessons`, `profile` (một bản ghi duy nhất, khoá `'me'`).
- `migrate.ts` giữ **danh sách bước nâng cấp**: `steps[n]` đưa dữ liệu từ phiên bản n lên n+1. Không bao giờ xoá dữ liệu cũ cho nhanh — trẻ mất tiến độ là mất động lực.
- **Lưu tiến độ không bao giờ được làm hỏng buổi học**: Safari chế độ riêng tư, hết dung lượng hay người dùng chặn lưu trữ đều khiến IndexedDB ném lỗi. Mọi lời gọi đi qua `quietly()`; hỏng thì bỏ qua lặng lẽ, trẻ vẫn chạy và chấm code bình thường.
- Xoá dữ liệu: `deleteAllData()` dọn từng store trước rồi mới xoá database. Xoá database có thể bị chặn khi trẻ mở lalakode ở tab khác, nên bước dọn store mới là thứ bảo đảm lời hứa "xoá là mất thật".
- Huy hiệu (`progress/badges.ts`): **hàm thuần** tính từ ảnh chụp tiến độ, nên không hỏng khi nội dung khoá học thay đổi. Sáu huy hiệu đầu đều tính được chỉ từ tiến độ, không cần biết nội dung bài.
- **Huy hiệu chỉ được thêm, không bị lấy lại**: streak đứt thì mất chuỗi ngày, nhưng huy hiệu đã nhận vẫn còn.
- Bài học coi là xong khi **mọi bài tập của nó đã đạt**; màn bài tập xét điều này sau mỗi lần nộp rồi mới trao huy hiệu.
- Mốc thời gian lưu ISO UTC (để sau này đồng bộ), còn "ngày" cho streak tính theo **lịch máy** — học 23h hôm nay và 7h sáng mai phải là hai ngày liền nhau.
- Lưu: bài đã xong, số lần chạy, thời điểm, streak, huy hiệu, code nháp gần nhất mỗi bài. **Không** lưu tên thật; "biệt danh" (tuỳ chọn) chỉ ở máy.
- **Mã tiến độ** (`progress/share-code.ts`): JSON → nén `deflate-raw` → base64url, có tiền tố phiên bản (`LLC1.` nén, `LLC0.` không nén cho trình duyệt thiếu `CompressionStream`).
  - **Không chứa `draftCode`.** Trẻ hay dán mã vào chỗ công khai (nhóm chat, ghi chú), mà code tự gõ có thể vô tình có tên thật. Chuyển máy chỉ cần biết bài nào xong.
  - Nhập mã là **gộp, không ghi đè**: bài đã xong ở một trong hai máy thì vẫn xong, số lần thử lấy lớn hơn, huy hiệu hợp nhất, streak lấy dài hơn, nháp của máy hiện tại giữ nguyên. Trẻ nhập mã cũ vào máy đã học vài bài sẽ không mất bài nào.
  - Mã của phiên bản schema mới hơn thì từ chối với thông báo riêng, không cố đoán.
- **Link báo cáo cho bố mẹ:** `https://<domain>/bao-cao#<mã>` — dùng **chính mã tiến độ** của S0-14, nên cũng không mang code của trẻ. Phần sau `#` trình duyệt không gửi lên server; trang báo cáo tự giải mã và hiển thị.
  - Chỉ hiện **số liệu**: bài tập đã xong, bài học trọn vẹn, streak, huy hiệu, số lần nộp bài, ngày học gần nhất, và tiến độ từng bài (tên bài lấy từ mục lục nội dung).
  - Giọng văn trang này dành cho **người lớn**, khác hẳn các trang cho trẻ. Khi mở bằng link, ô "tạo link" bị ẩn đi vì nó nói chuyện với trẻ.
  - Mục lục nội dung tải lỗi thì vẫn ra số liệu, chỉ thiếu tên bài.
- Schema progress được thiết kế trùng với bảng PostgreSQL ở giai đoạn 1 để sau này "đồng bộ" một chạm.

### 4. AI hint proxy (`services/ai-hint`)
- AWS Lambda (Node 22, TS), gọi qua CloudFront path `/api/hint` (cùng origin → không cần CORS rộng).
- Input: `{exerciseId, code ≤ 4 kB, error ≤ 2 kB, hintLevel 1–3, token}`. Server tự lấy đề bài theo `exerciseId` từ bundle nội dung — **không tin đề bài do client gửi**.
- Model: Claude Haiku 5.5 qua **Amazon Bedrock**, inference profile `global.anthropic.claude-haiku-5-5` (Singapore chỉ hỗ trợ profile global — request có thể được xử lý ở bất kỳ vùng nào). Gọi bằng `@aws-sdk/client-bedrock-runtime` (Converse API) với IAM role của Lambda; không có API key. `max_tokens` thấp (~400). Prompt hệ thống: không đưa lời giải đầy đủ, tiếng Việt cho trẻ 10–15 tuổi, từ chối chủ đề ngoài bài.
- Rate limit: `token` = UUID ngẫu nhiên tạo trên máy (không liên kết danh tính). Lambda lưu `sha256(token)` + ngày trong DynamoDB, TTL 48 h, **5 lượt/ngày/token**, cộng **trần 2000 lượt/ngày toàn hệ thống** để chặn chi phí.
  - Đếm bằng `UpdateItem` có `ConditionExpression`, không phải đọc-rồi-ghi: hai request cùng lúc không lách qua nhau được.
  - Đếm **trước khi** gọi Bedrock — hết lượt thì không tốn một xu nào.
  - Hết lượt của trẻ (`qua-nhieu-luot`) và hết hạn mức chung (`het-han-muc-ngay`) là hai mã khác nhau: cái sau không phải lỗi của trẻ nên UI nói khác đi.
- Không ghi log body request/response. Chỉ log: thời gian, mã kết quả, độ trễ, số token AI. Tất cả đi qua `logger.ts` — chỗ **duy nhất** trong service được phép in ra, để không ai lỡ để lại `console.log` gỡ rối kèm nội dung.
- Đề bài lấy từ bundle đã phát hành qua HTTP (cache 5 phút trong container), nên Lambda không phải build lại mỗi lần sửa nội dung. Bundle công khai này **không có lời giải**, nên AI cũng không thấy lời giải.
- Client gửi kèm trường lạ (ví dụ tự đính đề bài) thì **từ chối cả request** chứ không im lặng bỏ qua — `strictObject` của zod.
- Có công tắc tắt AI (biến môi trường) → frontend hiển thị gợi ý tĩnh viết sẵn trong bài.
- Panel gợi ý (`features/exercise/HintPanel.tsx`): mỗi lần bấm xin một mức sâu hơn (1→2→3). **Trẻ luôn nhận được gợi ý**: AI tắt, hết lượt, hay mạng hỏng thì rơi về gợi ý viết sẵn kèm một câu giải thích đúng lý do.
- Code chỉ rời máy **khi trẻ tự bấm xin trợ giúp** — chạy thử và nộp bài không gọi `/api/hint` (có test e2e).
- Token ẩn danh nằm trong hồ sơ IndexedDB, tạo khi dùng lần đầu, **không đi theo mã tiến độ** (hai máy dùng chung token thì chung luôn hạn mức, mà mã lại hay bị dán chỗ công khai).

### 5. Analytics gộp (chưa chốt — xem ADR 0005)
- Chỉ sự kiện gộp: `lesson_started`, `lesson_completed`, `exercise_passed`, `returned_after_7d`. Không ID người dùng, không cookie, không IP lưu trữ.

### 6. Video
- Bài miễn phí: nhúng YouTube chế độ `youtube-nocookie.com`, video đánh dấu "dành cho trẻ em".
- Dự phòng: HLS trên S3 + CloudFront (MediaConvert) nếu cần bỏ YouTube.

### 7. Infra (`infra/`, Terraform)
- S3 (private) + CloudFront (OAC), response headers: CSP chặt, COOP/COEP nếu dùng SharedArrayBuffer, HSTS.
- Lambda + Function URL (auth IAM, chỉ CloudFront gọi được qua OAC), DynamoDB on-demand, IAM role cho Lambda chỉ có `bedrock:InvokeModel` trên inference profile + model Haiku 5.5, bật model access Claude trong Bedrock, budget alarm 20 USD (gồm cả phí Claude tính qua AWS Marketplace).
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
