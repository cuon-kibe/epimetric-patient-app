/**
 * ECS Fargate構成
 * 
 * 概要:
 *   Next.jsとRails APIをECS Fargateで実行
 *   両サービスとも独立したタスク定義とサービスを持つ
 * 
 * Service Discovery統合:
 *   - Rails APIはService Discoveryに登録
 *   - Next.jsはrails-api.localという名前でRails APIにアクセス可能
 * 
 * 制限事項:
 *   - タスク定義のイメージURLは実際のECRリポジトリURLに置き換える必要がある
 *   - 初回デプロイ前にECRにイメージをプッシュしておくこと
 */

# ECSクラスター
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-cluster-${var.environment}"
  }
}

# ECSタスク実行ロール（ECRからのイメージプル、CloudWatch Logsへの書き込み用）
resource "aws_iam_role" "ecs_task_execution_role" {
  name_prefix = "${var.project_name}-ecs-exec-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecs-execution-role-${var.environment}"
  }
}

# ECSタスク実行ロールにAWS管理ポリシーをアタッチ
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECSタスクロール（アプリケーションがS3などにアクセスする用）
resource "aws_iam_role" "ecs_task_role" {
  name_prefix = "${var.project_name}-ecs-task-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecs-task-role-${var.environment}"
  }
}

# S3アクセスポリシー（CSVファイル用）
resource "aws_iam_role_policy" "ecs_task_s3_policy" {
  name_prefix = "s3-access-"
  role        = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.blood_test_results.arn,
          "${aws_s3_bucket.blood_test_results.arn}/*"
        ]
      }
    ]
  })
}

# CloudWatch Logsグループ（Next.js用）
resource "aws_cloudwatch_log_group" "nextjs" {
  name              = "/ecs/${var.project_name}-nextjs-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-nextjs-logs-${var.environment}"
  }
}

# CloudWatch Logsグループ（Rails用）
resource "aws_cloudwatch_log_group" "rails" {
  name              = "/ecs/${var.project_name}-rails-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-rails-logs-${var.environment}"
  }
}

# Next.jsタスク定義
resource "aws_ecs_task_definition" "nextjs" {
  family                   = "${var.project_name}-nextjs-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.nextjs_cpu
  memory                   = var.nextjs_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "nextjs"
      image = "${aws_ecr_repository.nextjs.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "API_URL"
          value = var.nextjs_api_url_internal
        },
        {
          name  = "RAILS_API_URL"
          value = "http://rails-api.local:3000"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.nextjs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-nextjs-task-${var.environment}"
  }
}

# Rails APIタスク定義
resource "aws_ecs_task_definition" "rails" {
  family                   = "${var.project_name}-rails-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.rails_cpu
  memory                   = var.rails_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "rails"
      image = "${aws_ecr_repository.rails.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "RAILS_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_HOST"
          value = aws_db_instance.main.address
        },
        {
          name  = "DATABASE_NAME"
          value = var.db_name
        },
        {
          name  = "DATABASE_USERNAME"
          value = var.db_username
        },
        {
          name  = "S3_BUCKET_NAME"
          value = aws_s3_bucket.blood_test_results.id
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        }
      ]

      secrets = [
        {
          name      = "DATABASE_PASSWORD"
          valueFrom = aws_secretsmanager_secret.db_password.arn
        },
        {
          name      = "SECRET_KEY_BASE"
          valueFrom = aws_secretsmanager_secret.rails_secret_key_base.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.rails.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-rails-task-${var.environment}"
  }
}

# Next.js ECSサービス
resource "aws_ecs_service" "nextjs" {
  name            = "${var.project_name}-nextjs-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.nextjs.arn
  desired_count   = var.nextjs_task_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_ecs[*].id
    security_groups  = [aws_security_group.nextjs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.nextjs.arn
    container_name   = "nextjs"
    container_port   = 3000
  }

  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener.https
  ]

  tags = {
    Name = "${var.project_name}-nextjs-service-${var.environment}"
  }
}

# Rails API ECSサービス（Service Discovery統合）
resource "aws_ecs_service" "rails" {
  name            = "${var.project_name}-rails-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.rails.arn
  desired_count   = var.rails_task_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private_ecs[*].id
    security_groups  = [aws_security_group.rails.id]
    assign_public_ip = false
  }

  # Service Discovery統合
  service_registries {
    registry_arn = aws_service_discovery_service.rails.arn
  }

  tags = {
    Name = "${var.project_name}-rails-service-${var.environment}"
  }
}


