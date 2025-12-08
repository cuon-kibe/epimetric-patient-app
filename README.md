# 血液検査結果管理アプリケーション (Epimetric Patient App)

患者が自分の血液検査結果を確認・管理できるWebアプリケーションです。

## 📋 目次

- [システム概要](#システム概要)
- [技術スタック](#技術スタック)
- [アーキテクチャ](#アーキテクチャ)
- [ローカル開発環境セットアップ](#ローカル開発環境セットアップ)
- [Docker環境セットアップ](#docker環境セットアップ)
- [AWS環境デプロイ](#aws環境デプロイ)
- [API仕様](#api仕様)
- [ディレクトリ構成](#ディレクトリ構成)

---

## 🚀 クイックスタート

**すぐにログインして動作確認したい方は [LOGIN_INFO.md](./LOGIN_INFO.md) をご覧ください。**

テスト用アカウント:
- メール: `test@example.com`
- パスワード: `password123`
- URL: http://localhost:4000/login

---

## システム概要

### 主な機能

- **患者認証**: メールアドレス・パスワードによる認証
- **CSVアップロード**: 血液検査結果のCSVファイルを手動アップロード
- **検査結果表示**: 過去の検査結果一覧と詳細表示
- **S3連携**: アップロードしたCSVファイルをS3に保存

### 対象ユーザー

- 血液検査を受けた患者
- 検査結果を継続的に管理したい方

---

## 技術スタック

### フロントエンド

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Axios** (HTTP client)
- **date-fns** (日付処理)

### バックエンド

- **Ruby 3.3.3**
- **Rails 8.0** (API mode)
- **PostgreSQL 16**
- **JWT** (認証)
- **AWS SDK for Ruby** (S3連携)

### インフラ

- **AWS ECS Fargate** (コンテナ実行環境)
- **AWS Service Discovery** (サービス間通信)
- **Application Load Balancer** (ロードバランサー)
- **RDS PostgreSQL** (データベース)
- **Amazon S3** (ファイルストレージ)
- **Amazon ECR** (Dockerイメージレジストリ)
- **VPC, サブネット, セキュリティグループ**

### DevOps

- **Docker & Docker Compose** (ローカル開発)
- **Terraform** (IaC)
- **GitHub Actions** (CI/CD)

---

## アーキテクチャ

### システム構成図

```
Internet
   ↓
CloudFront (Optional)
   ↓
Application Load Balancer (ALB)
   ↓
Next.js (ECS Fargate) ──Service Discovery──> Rails API (ECS Fargate)
                                                   ↓
                                              RDS PostgreSQL
                                                   ↓
                                              Amazon S3
```

### Service Discovery の利点

- **セキュリティ**: Rails APIを直接インターネットに公開しない
- **VPC内部通信**: Next.jsからRails APIへの通信がVPC内で完結
- **スケーラビリティ**: サービスの追加・変更が容易
- **コスト最適化**: ALB 1台で済む（2台構成より月$15節約）
- **低レイテンシ**: VPC内部直接通信で高速（1-2ms）

**📖 詳細な技術的評価**: [SERVICE_DISCOVERY_ANALYSIS.md](./SERVICE_DISCOVERY_ANALYSIS.md) を参照

### ネットワーク構成

- **パブリックサブネット**: ALB配置
- **プライベートサブネット (ECS)**: Next.js, Rails APIコンテナ
- **プライベートサブネット (RDS)**: PostgreSQLデータベース

---

## ローカル開発環境セットアップ

### 前提条件

- Ruby 3.3.3
- Node.js 20.17.0
- PostgreSQL 16
- Docker Desktop (オプション)

### 手順

#### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd epimetric-patient-app
```

#### 2. PostgreSQL の起動

**Dockerを使用する場合:**

```bash
docker-compose up db -d
```

**Homebrewを使用する場合:**

```bash
brew services start postgresql@16
```

#### 3. Rails バックエンドのセットアップ

```bash
cd backend

# 依存関係のインストール
bundle install

# 環境変数の設定
export DATABASE_HOST=localhost
export DATABASE_NAME=epimetric_patient_dev
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=password

# データベースの作成とマイグレーション
bundle exec rails db:create db:migrate

# サーバー起動
bundle exec rails s -p 3000
```

#### 4. Next.js フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
yarn install

# サーバー起動
yarn dev -p 4000
```

#### 5. アクセス

- **フロントエンド**: http://localhost:4000
- **バックエンドAPI**: http://localhost:3000

---

## Docker環境セットアップ

### Docker Compose で起動

```bash
# ビルド
docker-compose build

# 起動
docker-compose up

# バックグラウンドで起動
docker-compose up -d

# テストデータの作成（初回のみ）
docker compose exec backend bundle exec rails db:seed

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### 🎯 クイックスタート - ログイン情報

起動後、すぐにログインして動作確認できます:

**患者マイページ**: http://localhost:4000/login

| 項目 | 値 |
|------|-----|
| メールアドレス | `test@example.com` |
| パスワード | `password123` |
| 患者名 | 山田太郎 |

### トラブルシューティング

#### ネットワーク接続エラー

Docker buildでネットワークエラーが発生する場合:

1. Docker Desktop → Settings → Docker Engine
2. 以下のDNS設定を追加:

```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

3. Apply & Restart

#### ポート競合エラー

ポートが既に使用されている場合:

```bash
# ポートを使用しているプロセスを確認
lsof -i :5432
lsof -i :3000
lsof -i :4000

# プロセスを終了
kill -9 <PID>
```

---

## AWS環境デプロイ

### 前提条件

- AWS CLI インストール済み
- Terraform インストール済み
- AWS認証情報設定済み

### 手順

#### 1. Terraformで インフラ構築

```bash
cd terraform

# terraform.tfvars ファイルを作成
cp terraform.tfvars.example terraform.tfvars

# 必要な変数を編集
# - db_password
# - rails_secret_key_base (rails secret で生成)

# 初期化
terraform init

# プランの確認
terraform plan

# インフラ構築（15-20分程度）
terraform apply
```

#### 2. ECRにDockerイメージをプッシュ

```bash
# ECRログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com

# Railsイメージのビルドとプッシュ
cd backend
docker build -t <ECR_REPOSITORY_URL>:latest .
docker push <ECR_REPOSITORY_URL>:latest

# Next.jsイメージのビルドとプッシュ
cd ../frontend
docker build -t <ECR_REPOSITORY_URL>:latest .
docker push <ECR_REPOSITORY_URL>:latest
```

#### 3. ECSサービスの起動

```bash
# Terraformで自動的にサービスが起動します
# ALBのDNS名を確認
terraform output alb_dns_name
```

#### 4. GitHub Actions CI/CD設定

GitHub Repositoryに以下のSecretsを設定:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPOSITORY_BACKEND`
- `ECR_REPOSITORY_FRONTEND`
- `ECS_CLUSTER`
- `ECS_SERVICE_BACKEND`
- `ECS_SERVICE_FRONTEND`

---

## API仕様

### 認証エンドポイント

#### ログイン
```
POST /api/v1/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token",
  "patient": {
    "id": 1,
    "email": "user@example.com",
    "name": "山田太郎"
  }
}
```

#### 患者登録
```
POST /api/v1/patients
Content-Type: application/json

{
  "patient": {
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "name": "山田太郎",
    "date_of_birth": "1990-01-01"
  }
}
```

### 血液検査結果エンドポイント

#### 検査結果一覧取得
```
GET /api/v1/blood_test_results
Authorization: Bearer <token>

Response:
{
  "blood_test_results": [
    {
      "id": 1,
      "test_date": "2024-01-15",
      "created_at": "2024-01-16T10:00:00Z",
      "items_count": 15
    }
  ]
}
```

#### CSVアップロード
```
POST /api/v1/blood_test_results/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv_file>
test_date: "2024-01-15" (optional)
```

---

## ディレクトリ構成

```
epimetric-patient-app/
├── backend/                    # Rails APIアプリケーション
│   ├── app/
│   │   ├── controllers/        # APIコントローラー
│   │   │   └── api/v1/
│   │   ├── models/             # データモデル
│   │   └── services/           # ビジネスロジック
│   ├── config/                 # 設定ファイル
│   ├── db/                     # データベースマイグレーション
│   ├── lib/                    # ライブラリ (JWT等)
│   ├── Dockerfile              # 本番用Dockerfile
│   └── Gemfile                 # Ruby依存関係
│
├── frontend/                   # Next.jsアプリケーション
│   ├── app/                    # App Router
│   │   ├── login/              # ログインページ
│   │   ├── register/           # 登録ページ
│   │   ├── dashboard/          # ダッシュボード
│   │   └── results/[id]/       # 検査結果詳細
│   ├── lib/                    # ユーティリティ
│   │   └── api/                # APIクライアント
│   ├── Dockerfile              # 本番用Dockerfile
│   └── package.json            # Node依存関係
│
├── terraform/                  # Infrastructure as Code
│   ├── main.tf                 # メイン設定
│   ├── vpc.tf                  # VPCネットワーク
│   ├── ecs.tf                  # ECS Fargate
│   ├── service_discovery.tf    # Service Discovery
│   ├── alb.tf                  # ロードバランサー
│   ├── rds.tf                  # PostgreSQL
│   ├── s3.tf                   # S3バケット
│   ├── ecr.tf                  # ECRリポジトリ
│   └── outputs.tf              # アウトプット変数
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CDパイプライン
│
├── docker-compose.yml          # ローカル開発環境
└── README.md                   # このファイル
```

---

## テストデータの作成

### テスト用患者アカウント

開発環境では以下のテスト用アカウントでログインできます:

**ログイン情報:**
- **メールアドレス**: `test@example.com`
- **パスワード**: `password123`
- **患者名**: 山田太郎
- **生年月日**: 1990-01-01

**ログインURL**: http://localhost:4000/login

### テストデータの作成方法

```bash
# テスト用患者データの作成（Docker環境）
docker compose exec backend bundle exec rails db:seed

# ローカル環境の場合
cd backend
bundle exec rails db:seed
```

### CSVフォーマット例

```csv
項目名,結果値,基準値下限,基準値上限,単位
WBC,5.2,3.5,9.0,10^3/μL
RBC,4.5,4.0,5.5,10^6/μL
HGB,14.0,13.0,17.0,g/dL
HCT,42.0,40.0,50.0,%
PLT,250,150,400,10^3/μL
```

---

## セキュリティ考慮事項

### 実装済みセキュリティ対策

- ✅ JWT トークンによるステートレス認証
- ✅ bcryptによるパスワードハッシュ化
- ✅ CORS設定
- ✅ Rails APIのVPC内部配置（Service Discovery）
- ✅ セキュリティグループによるネットワーク制限
- ✅ RDS暗号化
- ✅ S3バケットのパブリックアクセスブロック

### 本番環境での追加推奨事項

- [ ] HTTPS/SSL証明書の設定（ACM）
- [ ] WAF (Web Application Firewall) 導入
- [ ] CloudWatch による監視・アラート設定
- [ ] バックアップ戦略の実装
- [ ] ログの長期保存とモニタリング
- [ ] 多要素認証（MFA）の実装
- [ ] HIPAA/個人情報保護法への準拠確認

---

## ライセンス

このプロジェクトはプライベート使用を目的としています。

---

## お問い合わせ

質問やフィードバックがある場合は、Issueを作成してください。

