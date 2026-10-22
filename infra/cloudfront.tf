resource "aws_cloudfront_origin_access_control" "web" {
  name                              = "lalacode-web-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# --- Cache ------------------------------------------------------------------
# File có hash trong tên (JS/CSS của Vite, Pyodide theo phiên bản, bài học theo
# hash nội dung) thì cache vĩnh viễn. index.html và content/index.json phải
# luôn hỏi lại, nếu không trẻ sẽ kẹt ở bản cũ sau khi mình phát hành.

resource "aws_cloudfront_cache_policy" "immutable" {
  name        = "lalacode-immutable"
  default_ttl = 31536000
  max_ttl     = 31536000
  min_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_cache_policy" "always_revalidate" {
  name        = "lalacode-always-revalidate"
  default_ttl = 0
  max_ttl     = 60
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# --- Header bảo mật ---------------------------------------------------------
# Không bật COOP/COEP: runner không dùng SharedArrayBuffer (xem architecture §2),
# mà bật lên sẽ chặn nhúng video YouTube sau này.
resource "aws_cloudfront_response_headers_policy" "web" {
  name = "lalacode-security-headers"

  security_headers_config {
    content_type_options { override = true }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = false
      override                   = true
    }

    content_security_policy {
      override = true
      # Đọc từ infra/csp.txt — **cùng một chuỗi** mà `npm run test:e2e:csp` dùng
      # để chạy thử bản build. CSP sai thì Pyodide chết trắng màn hình, nên nó
      # phải được kiểm trước khi deploy chứ không phải sau.
      #
      # - wasm-unsafe-eval: Pyodide là CPython biên dịch sang WebAssembly.
      # - worker-src blob:: Vite nạp web worker qua blob.
      # - style-src 'unsafe-inline': CodeMirror chèn <style> lúc chạy.
      # - frame-src youtube-nocookie: video bài học (docs/privacy.md).
      content_security_policy = trimspace(file("${path.module}/csp.txt"))
    }
  }
}

# --- Phân phối --------------------------------------------------------------
resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  comment             = "lalacode giai đoạn 0"
  default_root_object = "index.html"
  price_class         = var.price_class
  http_version        = "http2and3"
  is_ipv6_enabled     = true

  origin {
    domain_name              = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id                = "s3-web"
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
    origin_path              = "/${local.live_prefix}"
  }

  default_cache_behavior {
    target_origin_id           = "s3-web"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.always_revalidate.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.web.id
  }

  ordered_cache_behavior {
    path_pattern               = "/assets/*"
    target_origin_id           = "s3-web"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.immutable.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.web.id
  }

  ordered_cache_behavior {
    path_pattern               = "/pyodide/*"
    target_origin_id           = "s3-web"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.immutable.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.web.id
  }

  ordered_cache_behavior {
    path_pattern               = "/content/lessons/*"
    target_origin_id           = "s3-web"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.immutable.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.web.id
  }

  # SPA: đường dẫn tiếng Việt (/ban-do, /bai-tap/...) không có file tương ứng
  # trên S3, nên 403/404 phải trả index.html để router phía client lo.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # Log truy cập mặc định TẮT (docs/privacy.md): không cần, và có IP của trẻ.
}
