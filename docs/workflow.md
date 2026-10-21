# Quy trình làm việc

Áp dụng cho cả người và Claude Code.

## Vòng đời một việc

1. **Chọn việc** từ `docs/roadmap-stage0.md` (mỗi mục có mã `S0-xx`). Một việc = một nhánh = một PR nhỏ.
2. **Hiểu trước khi sửa:** đọc tài liệu liên quan (bảng "Đọc trước khi làm" trong `CLAUDE.md`) và code hiện có.
3. **Kế hoạch ngắn** (3–7 gạch đầu dòng): file sẽ sửa, test sẽ thêm, rủi ro. Việc đụng kiến trúc → viết ADR trước.
4. **Làm theo lát mỏng:** chạy được end-to-end sớm, rồi mới làm đẹp.
5. **Test đi kèm code** (xem `testing.md`). Bug fix luôn kèm test tái hiện.
6. **Tự kiểm tra:** `npm run check` → e2e liên quan → `content:verify` nếu đụng nội dung.
7. **Review tự động:** gọi agent `privacy-reviewer` nếu đụng dữ liệu/AI/analytics/log; `content-reviewer` nếu đụng `content/`.
8. **Commit** (Conventional Commits) và mở PR theo mẫu dưới.

## Definition of Done

- [ ] `npm run check` xanh (lint, typecheck, unit, content:check)
- [ ] Có test cho hành vi mới; e2e cho luồng người dùng chính nếu đụng UI
- [ ] Chạy thử trên viewport điện thoại (360×740) và tablet (820×1180)
- [ ] Văn bản UI tiếng Việt, đúng giọng thân thiện (xem `content-format.md` §Giọng văn)
- [ ] Không thêm dữ liệu gửi lên server ngoài những gì `privacy.md` cho phép
- [ ] Tài liệu cập nhật nếu thay đổi hành vi/kiến trúc
- [ ] Không có `console.log` debug, không có TODO không mã việc

## Nhánh & commit

- Nhánh: `feat/S0-07-runner-timeout`, `fix/...`, `content/...`, `docs/...`, `infra/...`
- Commit: `type(scope): mô tả` bằng tiếng Anh. `type` ∈ feat, fix, content, docs, test, refactor, chore, infra, perf.
- Không force-push lên `main`. `main` luôn deploy được.

## Mẫu mô tả PR

```
## Việc
S0-xx — <tên>

## Thay đổi
- ...

## Kiểm tra
- [ ] npm run check
- [ ] e2e: <spec>
- [ ] mobile/tablet

## Dữ liệu & quyền riêng tư
Có gửi/lưu dữ liệu mới không? <không / mô tả>
```

## Phát hành

- PR merge vào `main` → GitHub Actions: check → build → e2e trên bản build → upload S3 → invalidate CloudFront.
- Lambda `ai-hint` deploy riêng qua workflow `deploy-ai-hint` khi `services/ai-hint/**` thay đổi.
- Thay đổi `infra/`: CI chỉ chạy `terraform plan` và đăng kết quả vào PR; người duy trì tự `apply`.

## Khi có sự cố

1. Tắt AI bằng biến môi trường `AI_HINTS_ENABLED=false` nếu chi phí bất thường hoặc AI trả nội dung không phù hợp.
2. Rollback frontend: trỏ CloudFront về prefix build trước (mỗi build lưu ở `s3://.../releases/<sha>/`).
3. Ghi lại vào `docs/incidents/YYYY-MM-DD-<tên>.md`: chuyện gì, ảnh hưởng, nguyên nhân, cách sửa, phòng ngừa.
