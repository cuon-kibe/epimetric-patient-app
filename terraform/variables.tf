# Terraform変数定義
#
# 概要:
#   AWS環境構築で使用する変数を定義
#
# 使い方:
#   terraform.tfvarsファイルで値を設定
#   または環境変数 TF_VAR_<変数名> で設定

variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "epimetric-patient"
}

variable "environment" {
  description = "環境名（dev, staging, prod）"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "availability_zones" {
  description = "使用するアベイラビリティゾーン"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

# VPC設定
variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

# RDS設定
variable "db_instance_class" {
  description = "RDSインスタンスクラス"
  type        = string
  default     = "db.t4g.micro" # 小規模: db.t4g.micro, 中規模: db.t4g.small, 大規模: db.r6g.large
}

variable "db_allocated_storage" {
  description = "RDSストレージサイズ（GB）"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "epimetric_patient_prod"
}

variable "db_username" {
  description = "データベース管理者ユーザー名"
  type        = string
  default     = "epimetric_admin"
}

variable "db_password" {
  description = "データベースパスワード（Secrets Managerに保存推奨）"
  type        = string
  sensitive   = true
}

variable "db_multi_az" {
  description = "RDS Multi-AZ構成を有効化"
  type        = bool
  default     = true
}

variable "db_backup_retention_period" {
  description = "RDSバックアップ保持期間（日）"
  type        = number
  default     = 7
}

# ECS設定
variable "backend_cpu" {
  description = "バックエンドタスクのCPUユニット（256, 512, 1024, 2048, 4096）"
  type        = number
  default     = 512 # 0.5vCPU
}

variable "backend_memory" {
  description = "バックエンドタスクのメモリ（MB）"
  type        = number
  default     = 1024 # 1GB
}

variable "backend_desired_count" {
  description = "バックエンドタスクの希望数"
  type        = number
  default     = 2
}

variable "frontend_cpu" {
  description = "フロントエンドタスクのCPUユニット"
  type        = number
  default     = 512 # 0.5vCPU
}

variable "frontend_memory" {
  description = "フロントエンドタスクのメモリ（MB）"
  type        = number
  default     = 1024 # 1GB
}

variable "frontend_desired_count" {
  description = "フロントエンドタスクの希望数"
  type        = number
  default     = 2
}

# ドメイン設定
variable "domain_name" {
  description = "アプリケーションのドメイン名"
  type        = string
  default     = "" # 例: app.yourdomain.com
}

variable "route53_zone_id" {
  description = "Route53ホストゾーンID（既存の場合）"
  type        = string
  default     = ""
}

# タグ設定
variable "tags" {
  description = "すべてのリソースに適用するタグ"
  type        = map(string)
  default = {
    Project     = "EpimetricPatient"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# コスト最適化設定
variable "enable_nat_gateway" {
  description = "NAT Gatewayを有効化（無効化するとコスト削減だがプライベートサブネットから外部通信不可）"
  type        = bool
  default     = true
}

variable "enable_cloudfront" {
  description = "CloudFrontを有効化（静的アセット配信高速化）"
  type        = bool
  default     = true
}

variable "enable_waf" {
  description = "AWS WAFを有効化（セキュリティ強化、追加コスト発生）"
  type        = bool
  default     = false
}

# Auto Scaling設定
variable "enable_autoscaling" {
  description = "ECS Auto Scalingを有効化"
  type        = bool
  default     = true
}

variable "autoscaling_min_capacity" {
  description = "Auto Scalingの最小タスク数"
  type        = number
  default     = 2
}

variable "autoscaling_max_capacity" {
  description = "Auto Scalingの最大タスク数"
  type        = number
  default     = 10
}

variable "autoscaling_target_cpu" {
  description = "Auto ScalingのターゲットCPU使用率（%）"
  type        = number
  default     = 70
}

variable "autoscaling_target_memory" {
  description = "Auto ScalingのターゲットMemory使用率（%）"
  type        = number
  default     = 80
}
