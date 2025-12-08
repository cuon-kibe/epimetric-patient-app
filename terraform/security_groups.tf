/**
 * セキュリティグループ定義
 * 
 * 概要:
 *   各コンポーネント間の通信を最小権限の原則で制御
 * 
 * セキュリティポリシー:
 *   - ALB: インターネットからHTTPS(443)のみ許可
 *   - Next.js: ALBからのみアクセス許可
 *   - Rails API: Next.jsからのみアクセス許可（Service Discovery経由）
 *   - RDS: ECSタスクからのみアクセス許可
 * 
 * 注意点:
 *   - 本番環境では必ずHTTPSを使用すること
 *   - テスト環境ではHTTP(80)も許可しているが、本番では削除推奨
 */

# ALB用セキュリティグループ
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-sg-"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  # インターネットからHTTPSアクセスを許可
  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # テスト用にHTTPも許可（本番環境では削除推奨）
  ingress {
    description = "HTTP from Internet (for testing)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 全てのアウトバウンド通信を許可
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Next.js用セキュリティグループ
resource "aws_security_group" "nextjs" {
  name_prefix = "${var.project_name}-nextjs-sg-"
  description = "Security group for Next.js ECS tasks"
  vpc_id      = aws_vpc.main.id

  # ALBからのアクセスのみ許可
  ingress {
    description     = "HTTP from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # 全てのアウトバウンド通信を許可（Rails API、外部API呼び出しのため）
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-nextjs-sg-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Rails API用セキュリティグループ
resource "aws_security_group" "rails" {
  name_prefix = "${var.project_name}-rails-sg-"
  description = "Security group for Rails API ECS tasks"
  vpc_id      = aws_vpc.main.id

  # Next.jsからのアクセスのみ許可（Service Discovery経由）
  ingress {
    description     = "HTTP from Next.js"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.nextjs.id]
  }

  # 全てのアウトバウンド通信を許可（RDS、S3、外部API呼び出しのため）
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rails-sg-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# RDS用セキュリティグループ
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-sg-"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  # Rails APIからのPostgreSQLアクセスのみ許可
  ingress {
    description     = "PostgreSQL from Rails"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rails.id]
  }

  # アウトバウンド通信は不要だが、Terraformのデフォルト動作のため明示的に定義
  egress {
    description = "No outbound required"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# VPCエンドポイント用セキュリティグループ（S3、ECR用）
resource "aws_security_group" "vpc_endpoints" {
  name_prefix = "${var.project_name}-vpc-endpoints-sg-"
  description = "Security group for VPC endpoints"
  vpc_id      = aws_vpc.main.id

  # ECSタスクからのHTTPSアクセスを許可
  ingress {
    description = "HTTPS from ECS tasks"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [
      aws_security_group.nextjs.id,
      aws_security_group.rails.id
    ]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-vpc-endpoints-sg-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

