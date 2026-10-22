variable "aws_region" {
  description = "Vùng đặt S3. Singapore là gần Việt Nam nhất."
  type        = string
  default     = "ap-southeast-1"
}

variable "bucket_name" {
  description = "Tên bucket chứa web tĩnh. Để trống thì tự đặt theo số tài khoản."
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "Repo được phép deploy qua OIDC, dạng owner/repo."
  type        = string
  default     = "lananhtrande/lalacode"
}

variable "price_class" {
  description = "PriceClass_200 gồm cả edge ở Việt Nam mà vẫn rẻ hơn All."
  type        = string
  default     = "PriceClass_200"
}

variable "create_github_oidc_provider" {
  description = "Bật nếu tài khoản AWS chưa có OIDC provider của GitHub. Mỗi tài khoản chỉ được có một."
  type        = bool
  default     = true
}
