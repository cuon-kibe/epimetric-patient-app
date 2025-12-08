/**
 * VPCネットワーク構成
 * 
 * 概要:
 *   マルチAZ構成のVPCを作成
 *   パブリックサブネット: ALB、NAT Gateway配置
 *   プライベートサブネット: ECSタスク、RDS配置
 * 
 * セキュリティ設計:
 *   - Rails APIはプライベートサブネットのみ
 *   - Next.jsはパブリックサブネット（ALB経由でアクセス）
 *   - RDSはプライベートサブネットで完全隔離
 * 
 * 制限事項:
 *   - テスト用構成のためNAT Gatewayは1つのみ（本番では冗長化推奨）
 */

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc-${var.environment}"
  }
}

# インターネットゲートウェイ
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw-${var.environment}"
  }
}

# パブリックサブネット
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}-${var.environment}"
    Type = "public"
  }
}

# プライベートサブネット（ECS用）
resource "aws_subnet" "private_ecs" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-private-ecs-subnet-${count.index + 1}-${var.environment}"
    Type = "private"
  }
}

# プライベートサブネット（RDS用）
resource "aws_subnet" "private_rds" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 20)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-private-rds-subnet-${count.index + 1}-${var.environment}"
    Type = "private-rds"
  }
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip-${var.environment}"
  }

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateway（テスト用は1つのみ、本番環境では各AZに配置を推奨）
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${var.project_name}-nat-${var.environment}"
  }

  depends_on = [aws_internet_gateway.main]
}

# パブリックサブネット用ルートテーブル
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt-${var.environment}"
  }
}

# パブリックサブネットとルートテーブルの関連付け
resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# プライベートサブネット用ルートテーブル
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-private-rt-${var.environment}"
  }
}

# プライベートサブネット（ECS）とルートテーブルの関連付け
resource "aws_route_table_association" "private_ecs" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private_ecs[count.index].id
  route_table_id = aws_route_table.private.id
}

# プライベートサブネット（RDS）とルートテーブルの関連付け
resource "aws_route_table_association" "private_rds" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private_rds[count.index].id
  route_table_id = aws_route_table.private.id
}

