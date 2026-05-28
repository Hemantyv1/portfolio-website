terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "Production"
      Project     = "Portfolio"
      ManagedBy   = "Terraform"
    }
  }
}

resource "aws_s3_bucket" "portfolio_website" {
  bucket = var.bucket_name
  
  tags = {
    Name        = "Portfolio Website"
    Environment = "Production"
    Project     = "Portfolio"
  }
}

resource "aws_s3_bucket_website_configuration" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_versioning" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_website.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets  = true
}

resource "aws_cloudfront_origin_access_identity" "portfolio_oai" {
  comment = "OAI for portfolio website S3 bucket"
}

data "aws_iam_policy_document" "s3_bucket_policy" {
  statement {
    sid    = "AllowCloudFrontOAI"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.portfolio_oai.iam_arn]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.portfolio_website.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_website.id
  policy = data.aws_iam_policy_document.s3_bucket_policy.json
}

resource "aws_s3_bucket_lifecycle_configuration" "portfolio_website" {
  bucket = aws_s3_bucket.portfolio_website.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"
    }
  }

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

resource "aws_cloudfront_distribution" "portfolio_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Portfolio website CDN distribution"
  default_root_object = "index.html"
  
  price_class = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.portfolio_website.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.portfolio_website.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.portfolio_oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.portfolio_website.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "Portfolio Website CDN"
    Environment = "Production"
    Project     = "Portfolio"
  }
}
