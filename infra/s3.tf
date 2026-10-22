data "aws_caller_identity" "current" {}

locals {
  bucket_name = var.bucket_name != "" ? var.bucket_name : "lalacode-web-${data.aws_caller_identity.current.account_id}"

  # Mỗi lần deploy ghi vào releases/<sha>/ rồi đồng bộ sang current/.
  # CloudFront chỉ đọc current/, nên rollback = chép lại một release cũ.
  live_prefix = "current"
}

resource "aws_s3_bucket" "web" {
  bucket = local.bucket_name
}

# Bucket private tuyệt đối: chỉ CloudFront đọc được qua OAC.
resource "aws_s3_bucket_public_access_block" "web" {
  bucket                  = aws_s3_bucket.web.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "web" {
  bucket = aws_s3_bucket.web.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "web" {
  bucket = aws_s3_bucket.web.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Bản build cũ chỉ giữ 90 ngày; đủ để rollback mà không phình chi phí.
resource "aws_s3_bucket_lifecycle_configuration" "web" {
  bucket = aws_s3_bucket.web.id

  rule {
    id     = "don-release-cu"
    status = "Enabled"

    filter {
      prefix = "releases/"
    }

    expiration {
      days = 90
    }
  }

  rule {
    id     = "don-ban-cu-cua-file"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

data "aws_iam_policy_document" "web_bucket" {
  statement {
    sid       = "ChiCloudFrontDuocDoc"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.web.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.web.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
  policy = data.aws_iam_policy_document.web_bucket.json
}
