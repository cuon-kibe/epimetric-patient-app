/**
 * Application Load Balancer (ALB) 設定
 * 
 * 概要:
 *   Next.jsアプリケーション用の公開エンドポイント
 *   インターネットからのHTTP/HTTPSアクセスを受け付ける
 * 
 * セキュリティ:
 *   - HTTPS推奨（本番環境ではHTTPからHTTPSへリダイレクト設定を追加）
 *   - ALBからNext.jsへの通信はVPC内部のHTTP
 * 
 * 制限事項:
 *   - テスト構成のためHTTP(80)も許可
 *   - 本番環境ではACM証明書を設定してHTTPSのみに制限すること
 */

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "${var.project_name}-alb-${var.environment}"
  }
}

# Next.js用ターゲットグループ
resource "aws_lb_target_group" "nextjs" {
  name        = "${var.project_name}-nextjs-tg-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
    protocol            = "HTTP"
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-nextjs-tg-${var.environment}"
  }
}

# HTTPリスナー（テスト用）
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nextjs.arn
  }

  tags = {
    Name = "${var.project_name}-http-listener-${var.environment}"
  }
}

# HTTPSリスナー（ACM証明書が必要）
# 本番環境では以下のコメントを解除してACM証明書ARNを設定
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = "443"
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
#   certificate_arn   = var.acm_certificate_arn
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.nextjs.arn
#   }
#
#   tags = {
#     Name = "${var.project_name}-https-listener-${var.environment}"
#   }
# }

# HTTPからHTTPSへのリダイレクト（本番環境用）
# resource "aws_lb_listener" "http_redirect" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = "80"
#   protocol          = "HTTP"
#
#   default_action {
#     type = "redirect"
#
#     redirect {
#       port        = "443"
#       protocol    = "HTTPS"
#       status_code = "HTTP_301"
#     }
#   }
# }

# ダミーのHTTPSリスナー（Terraformエラー回避用、実際のACM証明書がある場合は上記のコメント解除して削除）
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nextjs.arn
  }

  tags = {
    Name = "${var.project_name}-https-listener-${var.environment}"
  }
}

