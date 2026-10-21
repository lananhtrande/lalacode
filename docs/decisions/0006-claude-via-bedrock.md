# 0006 — Gọi Claude qua Amazon Bedrock thay vì Claude API trực tiếp
Trạng thái: Chấp nhận (thay phần "nhà cung cấp model" của 0004)
Ngày: 2026-10-21

## Bối cảnh
ADR 0004 gọi Claude API của Anthropic bằng API key lưu trong Secrets Manager. Toàn bộ hạ tầng còn lại đã ở AWS.

## Quyết định
Lambda `ai-hint` gọi Claude Haiku 5.5 qua Amazon Bedrock, Converse API (`@aws-sdk/client-bedrock-runtime`), inference profile `global.anthropic.claude-haiku-5-5`, từ region `ap-southeast-1`. Xác thực bằng IAM role của Lambda, chỉ cấp `bedrock:InvokeModel` cho inference profile và model tương ứng. Bỏ `ANTHROPIC_API_KEY` và Secrets Manager.

## Hệ quả
- Tốt: không có API key để lộ hoặc xoay vòng; một hoá đơn và một budget alarm trên AWS; giá token bằng API trực tiếp khi dùng profile global.
- Xấu: Singapore chỉ hỗ trợ profile **global** cho Haiku 5.5 — request có thể được xử lý ở bất kỳ vùng nào, không có lựa chọn giữ dữ liệu ở châu Á. Chấp nhận được vì không gửi dữ liệu cá nhân (docs/privacy.md). Không có Batch API giảm 50% (không cần cho gợi ý thời gian thực). Model mới có thể lên Bedrock chậm hơn. Phí Claude tính qua AWS Marketplace — cần xác nhận AWS Activate credit có áp dụng không.
- Trung tính: phải bật model access cho Claude trong Bedrock console một lần.

## Phương án đã cân nhắc
Claude API trực tiếp (ADR 0004 cũ): có Batch API và model mới sớm hơn, nhưng cần quản lý API key và hoá đơn riêng. Profile theo vùng (+10% giá): chưa có cho Haiku 5.5 từ Singapore.
