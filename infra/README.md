# Hạ tầng — giai đoạn 0

Web tĩnh: S3 (private) + CloudFront (OAC). Không có server nào chạy code của trẻ, không có dữ liệu người dùng trên server (xem `docs/privacy.md`).

## Luật

- **Claude Code không chạy lệnh apply của Terraform** — chỉ `fmt`, `validate`, `plan`. Người duy trì tự apply (CLAUDE.md).
- State ở giai đoạn 0 nằm trên **máy người duy trì** (`infra/terraform.tfstate`, đã bị `.gitignore`). Khi có nhiều người cùng sửa hạ tầng thì chuyển sang backend `s3` có khoá.

## Dựng lần đầu

```bash
cd infra
terraform init
terraform plan     # xem trước
# rồi tự chạy lệnh apply của terraform
```

Nếu tài khoản AWS đã có sẵn OIDC provider của GitHub thì đặt `create_github_oidc_provider = false` — mỗi tài khoản chỉ được có một.

Xong rồi, lấy output đặt vào **repository variables** của GitHub (Settings → Secrets and variables → Actions → Variables):

| Biến | Lấy từ |
| --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | `terraform output deploy_role_arn` |
| `AWS_WEB_BUCKET` | `terraform output bucket_name` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | `terraform output distribution_id` |

Workflow `deploy-web.yml` **tự bỏ qua** khi chưa có `AWS_DEPLOY_ROLE_ARN`, nên merge vào `main` lúc chưa dựng hạ tầng cũng không sao.

## Cách deploy hoạt động

```
build → s3://<bucket>/releases/<sha>/   (giữ 90 ngày, để rollback)
      → s3://<bucket>/current/          (CloudFront chỉ đọc thư mục này)
      → invalidate /index.html, /content/index.json
```

CloudFront trỏ vào `current/` bằng `origin_path`, nên **rollback không phải sửa hạ tầng**: chép một release cũ đè lên `current/` rồi invalidate là xong (workflow riêng ở S0-25).

## Cache

| Đường dẫn | Cách cache | Vì sao |
| --- | --- | --- |
| `/assets/*` | vĩnh viễn, `immutable` | Vite đặt hash trong tên file |
| `/pyodide/*` | vĩnh viễn, `immutable` | thư mục mang số phiên bản |
| `/content/lessons/*` | vĩnh viễn, `immutable` | tên file mang hash nội dung |
| còn lại (`index.html`, `content/index.json`) | luôn hỏi lại | nếu không, trẻ kẹt ở bản cũ sau khi phát hành |

## Header bảo mật

Chuỗi CSP nằm ở **`infra/csp.txt`** và được dùng ở hai nơi:

1. `aws_cloudfront_response_headers_policy.web` đọc bằng `file()`.
2. `scripts/serve-dist.mjs` đọc đúng file đó để chạy thử bản build ngay trên máy.

Nhờ vậy `npm run test:e2e:csp` kiểm **đúng chuỗi sẽ được deploy**. CSP sai thì Pyodide không chạy nổi và trẻ chỉ thấy màn hình trắng — phải bắt trước khi lên thật, không phải sau.

**Không bật COOP/COEP**: runner không dùng `SharedArrayBuffer` (xem `docs/architecture.md` §2), mà bật lên sẽ chặn nhúng video YouTube.

**Log truy cập CloudFront để tắt** — log chứa IP của trẻ, mà mình không cần (docs/privacy.md).

## Chưa làm ở bước này

- Tên miền riêng + chứng chỉ ACM (đang dùng tên `*.cloudfront.net`).
- Preview cho từng PR, rollback tự động, đăng kết quả `terraform plan` vào PR: S0-25.
- Lambda `ai-hint`, DynamoDB, budget alarm: S0-18 và S0-24.
