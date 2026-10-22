terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Giai đoạn 0 dùng state ở máy người duy trì (xem infra/README.md).
  # Khi có nhiều người sửa hạ tầng thì chuyển sang backend "s3".
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project = "lalacode"
      Stage   = "0"
      Managed = "terraform"
    }
  }
}

# CloudFront và các tài nguyên đi kèm phải ở us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project = "lalacode"
      Stage   = "0"
      Managed = "terraform"
    }
  }
}
