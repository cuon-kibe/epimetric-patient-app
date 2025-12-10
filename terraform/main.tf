/**
 * メインTerraform設定ファイル
 * 
 * 概要:
 *   血液検査結果管理アプリケーションのAWSインフラを定義
 *   Next.js (SSR) + Rails API構成をECS Fargateで実行
 *   Service Discoveryを使用してRails APIをVPC内部に閉じ込める
 * 
 * 主な仕様:
 *   - ECS Fargate構成（Next.js、Rails API）
 *   - Service Discovery（Rails API用内部DNS）
 *   - ALB（Next.js用公開エンドポイント）
 *   - RDS PostgreSQL（データベース）
 *   - S3（CSVファイル保管）
 * 
 * 制限事項:
 *   - テスト用構成のため、マルチAZ構成だが最小スペック
 *   - 本番運用時は適宜スペック調整が必要
 */

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # 必要に応じてS3バックエンドを設定
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "epimetric-patient-app/terraform.tfstate"
  #   region = "ap-northeast-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "epimetric-patient-app"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}


