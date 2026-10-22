# Lambda gợi ý AI + bảng đếm lượt. Lambda nằm sau CloudFront cùng domain
# (/api/hint) nên không cần CORS rộng (docs/architecture.md §4).

resource "aws_dynamodb_table" "hint_counter" {
  name         = "lalacode-hint-counter"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  # Bộ đếm tự biến mất sau 48 giờ. Bảng này chỉ chứa sha256(token) + ngày +
  # số đếm — không nói lên trẻ nào, ở đâu (docs/privacy.md).
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ai_hint" {
  name               = "lalacode-ai-hint"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "ai_hint" {
  statement {
    sid       = "GhiLogCuaChinhMinh"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.ai_hint.arn}:*"]
  }

  statement {
    sid     = "DemLuotGoiY"
    actions = ["dynamodb:UpdateItem"]
    # Chỉ đúng bảng đếm, và chỉ đúng một hành động.
    resources = [aws_dynamodb_table.hint_counter.arn]
  }

  statement {
    sid     = "GoiClaudeHaiku"
    actions = ["bedrock:InvokeModel"]
    # Chỉ đúng model Haiku 5.5 qua inference profile global (ADR 0006),
    # không mở cho mọi model trong Bedrock.
    resources = [
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-5-5-*",
      "arn:aws:bedrock:*:${data.aws_caller_identity.current.account_id}:inference-profile/global.anthropic.claude-haiku-5-5",
    ]
  }
}

resource "aws_iam_role_policy" "ai_hint" {
  name   = "lalacode-ai-hint"
  role   = aws_iam_role.ai_hint.id
  policy = data.aws_iam_policy_document.ai_hint.json
}

# Log giữ 7 ngày: log chỉ có thời gian/mã kết quả/độ trễ/số token, nhưng giữ
# lâu cũng chẳng để làm gì (docs/privacy.md).
resource "aws_cloudwatch_log_group" "ai_hint" {
  name              = "/aws/lambda/lalacode-ai-hint"
  retention_in_days = 7
}

# Gói code thật do workflow deploy-ai-hint.yml đẩy lên; ở đây chỉ cần một gói
# rỗng để tạo function lần đầu.
data "archive_file" "ai_hint_placeholder" {
  type                    = "zip"
  output_path             = "${path.module}/.terraform/ai-hint-placeholder.zip"
  source_content          = "export const handler = async () => ({ statusCode: 503, body: '{\"error\":\"ai-dang-tat\"}' });"
  source_content_filename = "index.mjs"
}

resource "aws_lambda_function" "ai_hint" {
  function_name = "lalacode-ai-hint"
  role          = aws_iam_role.ai_hint.arn
  runtime       = "nodejs22.x"
  handler       = "index.handler"
  filename      = data.archive_file.ai_hint_placeholder.output_path
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      # Cố ý KHÔNG trỏ thẳng vào aws_cloudfront_distribution.web: Lambda nằm
      # trong origin của chính distribution đó, tham chiếu ngược sẽ tạo vòng
      # lặp phụ thuộc. Lần apply đầu để trống, lấy `site_url` ở output rồi đặt
      # `site_base_url` và apply lần hai (xem infra/README.md).
      CONTENT_BASE_URL = var.site_base_url
      RATE_LIMIT_TABLE = aws_dynamodb_table.hint_counter.name
      AI_HINTS_ENABLED = var.ai_hints_enabled ? "true" : "false"
    }
  }

  # Code do CI deploy, Terraform không giành quyền quản lý nó.
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }

  depends_on = [aws_cloudwatch_log_group.ai_hint]
}

resource "aws_lambda_function_url" "ai_hint" {
  function_name      = aws_lambda_function.ai_hint.function_name
  authorization_type = "AWS_IAM" # chỉ CloudFront gọi được, không ai gọi thẳng
}

resource "aws_lambda_permission" "cloudfront" {
  statement_id           = "ChoCloudFrontGoi"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.ai_hint.function_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = aws_cloudfront_distribution.web.arn
  function_url_auth_type = "AWS_IAM"
}
