/**
 * ECR (Elastic Container Registry) リポジトリ設定
 * 
 * 概要:
 *   Next.jsとRails APIのDockerイメージを保管するプライベートレジストリ
 * 
 * イメージライフサイクル:
 *   - 最新10イメージのみ保持（古いイメージは自動削除）
 *   - ストレージコスト削減のため
 * 
 * セキュリティ:
 *   - イメージスキャン有効（脆弱性検出）
 *   - プライベートリポジトリ（AWS内部のみアクセス可能）
 */

# Next.js用ECRリポジトリ
resource "aws_ecr_repository" "nextjs" {
  name                 = "${var.project_name}-nextjs-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-nextjs-ecr-${var.environment}"
  }
}

# Next.jsリポジトリのライフサイクルポリシー
resource "aws_ecr_lifecycle_policy" "nextjs" {
  repository = aws_ecr_repository.nextjs.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Rails API用ECRリポジトリ
resource "aws_ecr_repository" "rails" {
  name                 = "${var.project_name}-rails-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-rails-ecr-${var.environment}"
  }
}

# Rails APIリポジトリのライフサイクルポリシー
resource "aws_ecr_lifecycle_policy" "rails" {
  repository = aws_ecr_repository.rails.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

