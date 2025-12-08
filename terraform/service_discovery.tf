/**
 * AWS Cloud Map (Service Discovery) 設定
 * 
 * 概要:
 *   Rails APIをVPC内部でのみ利用可能な名前解決システムに登録
 *   Next.jsから "rails-api.local" という名前でアクセス可能
 * 
 * 技術的決定:
 *   Service Discoveryを使用する理由:
 *   - Rails APIを直接インターネットに公開しない
 *   - VPC内部DNSでサービス間通信を実現
 *   - 将来的なマイクロサービス化への対応
 *   - ALBを経由しない高速な内部通信
 * 
 * 適用範囲:
 *   - SSRを使用するフロントエンド・バックエンド分離構成
 *   - バックエンドAPIを外部公開したくない場合
 *   - 複数のバックエンドサービスがある場合
 * 
 * 使用例:
 *   Next.jsサーバーサイドで以下のようにアクセス:
 *   fetch('http://rails-api.local:3000/api/patients')
 * 
 * 注意点:
 *   - Service Discoveryはコンテナ起動時に自動登録される
 *   - DNS TTLは短く設定（5秒）してコンテナ入れ替え時の影響を最小化
 *   - 内部通信のみのため、HTTPSは不要（VPC内部で暗号化済み）
 */

# プライベートDNS名前空間
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "local"
  description = "Private DNS namespace for service discovery"
  vpc         = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-sd-namespace-${var.environment}"
  }
}

# Rails API用サービスディスカバリー
resource "aws_service_discovery_service" "rails" {
  name = "rails-api"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 5
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = {
    Name = "${var.project_name}-rails-sd-service-${var.environment}"
  }
}

