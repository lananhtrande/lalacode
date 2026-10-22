output "bucket_name" {
  description = "Bucket chứa web tĩnh."
  value       = aws_s3_bucket.web.id
}

output "distribution_id" {
  description = "Dùng cho lệnh invalidate khi deploy."
  value       = aws_cloudfront_distribution.web.id
}

output "site_url" {
  description = "Địa chỉ web (chưa gắn tên miền riêng)."
  value       = "https://${aws_cloudfront_distribution.web.domain_name}"
}

output "deploy_role_arn" {
  description = "Role mà GitHub Actions dùng để deploy."
  value       = aws_iam_role.github_deploy.arn
}
