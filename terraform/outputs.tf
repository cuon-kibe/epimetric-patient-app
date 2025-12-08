/**
 * Terraformアウトプット定義
 * 
 * 概要:
 *   デプロイ後に必要な情報を出力
 *   GitHub ActionsやCI/CDパイプラインから参照する
 */

output "alb_dns_name" {
  description = "ALBのDNS名（Next.jsへのアクセスURL）"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALBのRoute53ゾーンID"
  value       = aws_lb.main.zone_id
}

output "ecr_repository_nextjs_url" {
  description = "Next.js用ECRリポジトリURL"
  value       = aws_ecr_repository.nextjs.repository_url
}

output "ecr_repository_rails_url" {
  description = "Rails API用ECRリポジトリURL"
  value       = aws_ecr_repository.rails.repository_url
}

output "ecs_cluster_name" {
  description = "ECSクラスター名"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_nextjs_name" {
  description = "Next.js ECSサービス名"
  value       = aws_ecs_service.nextjs.name
}

output "ecs_service_rails_name" {
  description = "Rails API ECSサービス名"
  value       = aws_ecs_service.rails.name
}

output "rds_endpoint" {
  description = "RDSエンドポイント"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "血液検査結果保管用S3バケット名"
  value       = aws_s3_bucket.blood_test_results.id
}

output "service_discovery_namespace" {
  description = "Service Discovery名前空間"
  value       = aws_service_discovery_private_dns_namespace.main.name
}

output "rails_api_internal_url" {
  description = "Rails API内部通信URL（Service Discovery経由）"
  value       = "http://rails-api.local:3000"
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

