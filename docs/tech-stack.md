# Công nghệ — giai đoạn 0

Mọi thay đổi bảng này cần một ADR trong `docs/decisions/`.

| Lớp | Lựa chọn | Phiên bản | Lý do ngắn |
| --- | --- | --- | --- |
| Runtime dev | Node.js | 22 LTS | Dùng chung cho web, scripts, Lambda |
| Package manager | npm workspaces | — | Đơn giản, đủ cho monorepo nhỏ |
| Ngôn ngữ | TypeScript `strict` | 5.x | Bắt lỗi sớm, type dùng chung cho nội dung |
| Frontend | React | 19 | Quen thuộc, hệ sinh thái lớn (DataLab cũng dùng) |
| Build | Vite | mới nhất ổn định | Nhanh, hỗ trợ worker và WASM tốt |
| Routing | React Router (data router) | 7 | Route phía client, lazy-load theo trang |
| Style | Tailwind CSS + CSS variables cho theme | 4 | Nhanh; token màu/kích thước dùng chung |
| Editor | CodeMirror 6 + `@codemirror/lang-python` | 6 | Nhẹ hơn Monaco, chạy tốt trên tablet/điện thoại |
| Python runtime | Pyodide (tự host) | **314.0.7** (CPython 3.14) — ghim chính xác | CPython thật trong WASM; đổi phiên bản phải chạy lại e2e runner |
| Trạng thái UI | React state + Zustand cho store nhỏ | — | Không cần Redux |
| Lưu trữ máy | IndexedDB qua `idb` | — | Dung lượng lớn hơn localStorage, async |
| Schema nội dung | zod (`packages/content-schema`) | 3/4 | Một nguồn sự thật cho type + validate |
| Markdown | `react-markdown` (CommonMark, **chưa cần** `remark-gfm`) | — | Nội dung bài viết bằng Markdown. 20 bài hiện chỉ dùng tiêu đề, danh sách, khối code, `code`, **đậm** — thêm `remark-gfm` khi nào có bài cần bảng. Route bài học: 37,8 kB gzip. |
| Icon | lucide-react | — | Nhẹ, tree-shake |
| Unit test | Vitest + Testing Library | — | Cùng hệ Vite |
| E2E test | Playwright (Chromium, WebKit iPhone/iPad) | — | Kiểm tra Pyodide thật trên trình duyệt |
| Lint/format | ESLint (flat config) + Prettier | — | Hook chạy sau mỗi lần sửa file |
| Kiểm tra nội dung | Script Node + CPython 3.12+ (`content:verify`) | — | Lời giải mẫu pass, starter fail |
| AI | Claude Haiku 5.5 qua Amazon Bedrock, profile `global.anthropic.claude-haiku-5-5`, SDK `@aws-sdk/client-bedrock-runtime` | — | Giá token như API trực tiếp; IAM thay API key; một hoá đơn AWS (ADR 0006) |
| Serverless | AWS Lambda (Node 22) + Function URL sau CloudFront | — | Gần như 0 USD ở quy mô nhỏ |
| Rate limit | DynamoDB on-demand + TTL | — | Không cần server |
| Quyền truy cập AI | IAM role của Lambda (`bedrock:InvokeModel`) | — | Không có API key để lộ; Secrets Manager chỉ dùng nếu sau này có bí mật khác |
| Hosting | S3 Singapore + CloudFront (OAC) | — | 1 TB/tháng miễn phí, edge tại HN/HCM |
| IaC | Terraform | ≥1.9 | Dùng lại ở giai đoạn 1–2 |
| CI/CD | GitHub Actions + OIDC → AWS | — | Không khoá dài hạn |

## Ngân sách bundle

- JS chính (không tính Pyodide) ≤ 200 kB gzip; mỗi route lazy ≤ 80 kB gzip.
- Riêng route bài tập ≤ 150 kB gzip vì chứa CodeMirror (ADR 0007); hiện ~131 kB.
- Pyodide core tải ngầm, cache dài hạn (`immutable`, tên file có version).
- Lighthouse mobile (trang chủ): Performance ≥ 85, Accessibility ≥ 95.

## Trình duyệt hỗ trợ

Chrome/Edge 2 phiên bản gần nhất, Safari iOS/iPadOS 16.4+, Firefox mới nhất. Máy yếu (RAM 3–4 GB) phải chạy được bài cơ bản.

## Không dùng (và lý do)

- **Next.js / SSR server:** giai đoạn 0 là web tĩnh; SEO xử lý bằng prerender vài trang công khai lúc build.
- **Monaco:** nặng, kém trên mobile.
- **Firebase/Supabase Auth:** chưa có tài khoản ở giai đoạn 0; giai đoạn 1 dữ liệu phải nằm tại Việt Nam.
- **Google Analytics / Facebook Pixel:** cookie theo dõi, không phù hợp người dùng trẻ em.
- **Chạy code học sinh trên server:** không cần, tốn tiền, rủi ro bảo mật.
