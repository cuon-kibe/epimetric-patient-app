/**
 * Terraform変数定義ファイル
 * 
 * 概要:
 *   環境ごとに変更が必要な値を変数として定義
 * 
 * 使用方法:
 *   terraform.tfvarsファイルで値を上書き可能
 */

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "環境名（dev/staging/production）"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "プロジェクト名（リソース名のプレフィックスとして使用）"
  type        = string
  default     = "epimetric-patient"
}

# VPC設定
variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "使用するアベイラビリティゾーン"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

# ECS設定
variable "nextjs_cpu" {
  description = "Next.jsタスクのCPUユニット"
  type        = number
  default     = 256
}

variable "nextjs_memory" {
  description = "Next.jsタスクのメモリ(MB)"
  type        = number
  default     = 512
}

variable "rails_cpu" {
  description = "Rails APIタスクのCPUユニット"
  type        = number
  default     = 256
}

variable "rails_memory" {
  description = "Rails APIタスクのメモリ(MB)"
  type        = number
  default     = 512
}

variable "nextjs_task_count" {
  description = "Next.jsタスクの起動数"
  type        = number
  default     = 1
}

variable "rails_task_count" {
  description = "Rails APIタスクの起動数"
  type        = number
  default     = 1
}

# RDS設定
variable "db_instance_class" {
  description = "RDSインスタンスクラス"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "epimetric_patient"
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
  default     = "app_user"
  sensitive   = true
}

variable "db_password" {
  description = "データベースパスワード"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "RDSストレージサイズ(GB)"
  type        = number
  default     = 20
}

# アプリケーション設定
variable "rails_secret_key_base" {
  description = "Rails SECRET_KEY_BASE"
  type        = string
  sensitive   = true
}

variable "nextjs_api_url_internal" {
  description = "Next.jsからRails APIへの内部通信URL（Service Discovery経由）"
  type        = string
  default     = "http://rails-api.local:3000"
}

