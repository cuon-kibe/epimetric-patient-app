/**
 * RDS PostgreSQL データベース設定
 * 
 * 概要:
 *   患者情報、血液検査結果を保存するPostgreSQLデータベース
 *   プライベートサブネットに配置し、Rails APIからのみアクセス可能
 * 
 * セキュリティ:
 *   - マルチAZ配置でデータ冗長性を確保（本番環境推奨）
 *   - 自動バックアップ有効（7日間保持）
 *   - 暗号化有効
 * 
 * 制限事項:
 *   - テスト用のためdb.t4g.microを使用
 *   - 本番環境では適切なインスタンスクラスに変更すること
 *   - パスワードはSecrets Managerで管理
 */

# DBサブネットグループ
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_rds[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.environment}"
  }
}

# RDS PostgreSQLインスタンス
resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db-${var.environment}"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # バックアップ設定
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  # マルチAZ（本番環境推奨、テスト環境ではコスト削減のためfalseも可）
  multi_az = false

  # パフォーマンスインサイト（本番環境推奨）
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  # 削除保護（本番環境では有効化推奨）
  deletion_protection = false
  skip_final_snapshot = true
  # final_snapshot_identifier = "${var.project_name}-db-final-snapshot-${var.environment}"

  tags = {
    Name = "${var.project_name}-db-${var.environment}"
  }
}

# DBパスワード用Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name_prefix             = "${var.project_name}-db-password-"
  description             = "RDS PostgreSQL password"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-db-password-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

# Rails SECRET_KEY_BASE用Secrets Manager
resource "aws_secretsmanager_secret" "rails_secret_key_base" {
  name_prefix             = "${var.project_name}-rails-secret-"
  description             = "Rails SECRET_KEY_BASE"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-rails-secret-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "rails_secret_key_base" {
  secret_id     = aws_secretsmanager_secret.rails_secret_key_base.id
  secret_string = var.rails_secret_key_base
}

# Secrets Manager読み取り権限をECSタスク実行ロールに付与
resource "aws_iam_role_policy" "ecs_secrets_policy" {
  name_prefix = "secrets-access-"
  role        = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_password.arn,
          aws_secretsmanager_secret.rails_secret_key_base.arn
        ]
      }
    ]
  })
}

