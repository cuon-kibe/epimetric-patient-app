/**
 * S3バケット設定
 * 
 * 概要:
 *   血液検査結果のCSVファイルを保管するS3バケット
 * 
 * セキュリティ:
 *   - バケットポリシーでECSタスクロールからのアクセスのみ許可
 *   - バージョニング有効
 *   - 暗号化有効（AES256）
 *   - パブリックアクセスブロック有効
 * 
 * ライフサイクル:
 *   - 90日経過したファイルは自動的にGlacierに移行（コスト削減）
 *   - 本番環境では要件に応じて調整
 */

# 血液検査結果保管用S3バケット
resource "aws_s3_bucket" "blood_test_results" {
  bucket_prefix = "${var.project_name}-blood-test-results-"

  tags = {
    Name = "${var.project_name}-blood-test-results-${var.environment}"
  }
}

# バケットバージョニング
resource "aws_s3_bucket_versioning" "blood_test_results" {
  bucket = aws_s3_bucket.blood_test_results.id

  versioning_configuration {
    status = "Enabled"
  }
}

# バケット暗号化
resource "aws_s3_bucket_server_side_encryption_configuration" "blood_test_results" {
  bucket = aws_s3_bucket.blood_test_results.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# パブリックアクセスブロック
resource "aws_s3_bucket_public_access_block" "blood_test_results" {
  bucket = aws_s3_bucket.blood_test_results.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ライフサイクルルール（コスト最適化）
resource "aws_s3_bucket_lifecycle_configuration" "blood_test_results" {
  bucket = aws_s3_bucket.blood_test_results.id

  rule {
    id     = "archive-old-files"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CORS設定（Rails APIからのアップロードを許可）
resource "aws_s3_bucket_cors_configuration" "blood_test_results" {
  bucket = aws_s3_bucket.blood_test_results.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}


