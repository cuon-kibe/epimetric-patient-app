# Epimetric Patient App

患者向け血液検査結果閲覧アプリケーション

## 技術スタック

- **Frontend/Backend**: Next.js 16 (App Router)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **認証**: NextAuth.js v5 (Auth.js)
- **スタイリング**: Tailwind CSS v4
- **インフラ**: AWS ECS Fargate (Terraform)

---

## 開発環境セットアップ

### 前提条件

- Node.js 22+
- Docker / Docker Compose
- Yarn

### 方法1: Docker Compose（推奨）

最も簡単な方法です。DBとアプリを一緒に起動します。

```bash
# 全サービス起動（初回はビルドも実行）
docker compose up --build

# バックグラウンドで起動
docker compose up -d --build

# ログを確認
docker compose logs -f app

# 停止
docker compose down
```

起動後、自動的に以下が実行されます：
- データベースマイグレーション (`yarn db:push`)
- シードデータ投入 (`yarn db:seed`)

### 方法2: ローカル実行（DBのみDocker）

```bash
# DBを起動
docker compose up -d db

# 環境変数ファイルをコピー
cp env.local.example .env.local

# 依存関係インストール
yarn install

# Prismaクライアント生成
yarn db:generate

# マイグレーション
yarn db:push

# シードデータ投入
yarn db:seed

# 開発サーバー起動
yarn dev
```

---

## 検証環境での実行（docker run）

検証環境（ECS）と同じ構成でローカルテストする場合：

### 1. 環境変数ファイルを作成

```bash
cat > .env.docker << 'EOF'
DATABASE_URL=postgresql://postgres:password@host.docker.internal:5432/epimetric_patient_dev
AUTH_SECRET=your-secret-key-change-in-production
AUTH_URL=http://localhost:3000
NODE_ENV=development
EOF
```

### 2. DBを起動

```bash
docker compose up -d db
```

### 3. 開発用イメージをビルド・実行

```bash
# ビルド
docker build -t epimetric-patient-app .

# 実行
docker run -p 3000:3000 \
  --env-file .env.docker \
  --init \
  --name app \
  epimetric-patient-app
```

### 4. マイグレーション＆シード

```bash
docker exec -it app sh -c "yarn db:push && yarn db:seed"
```

### 5. 本番用イメージ（検証環境向け）

```bash
# 本番用イメージをビルド
docker build -f Dockerfile.prod -t epimetric-patient-app:prod .

# 実行
docker run -p 3000:3000 \
  --env-file .env.docker \
  --init \
  epimetric-patient-app:prod
```

---

## テストアカウント

シードデータ投入後、以下のアカウントでログインできます：

| 種別 | メールアドレス | パスワード | ログインURL |
|------|---------------|-----------|------------|
| 患者 | test@example.com | password123 | /login |
| 医療スタッフ | staff@example.com | staff123 | /mc/login |

---

## 主要なURL

| URL | 説明 |
|-----|------|
| http://localhost:3000 | トップページ |
| http://localhost:3000/login | 患者ログイン |
| http://localhost:3000/dashboard | 患者ダッシュボード |
| http://localhost:3000/mc | 医療センター（自動リダイレクト） |
| http://localhost:3000/mc/login | スタッフログイン |
| http://localhost:3000/mc/dashboard | スタッフダッシュボード |

---

## Prisma コマンド

```bash
# Prismaクライアント生成
yarn db:generate

# スキーマをDBに反映（開発用）
yarn db:push

# マイグレーションファイル作成（本番用）
yarn db:migrate

# シードデータ投入
yarn db:seed

# Prisma Studio（DB GUI）
DATABASE_URL="postgresql://postgres:password@localhost:5432/epimetric_patient_dev" npx prisma studio
```

---

## Docker関連ファイル

| ファイル | 用途 |
|---------|------|
| `Dockerfile` | 開発用（ホットリロード対応） |
| `Dockerfile.prod` | 本番/検証用（マルチステージビルド） |
| `docker-compose.yml` | ローカル開発環境 |
| `.dockerignore` | Dockerビルド時の除外ファイル |
| `.env.docker` | Docker実行時の環境変数（要作成） |

---

## ECS環境でのシード投入

### 方法1: ECS Exec

```bash
# タスクIDを取得
TASK_ID=$(aws ecs list-tasks \
  --cluster epimetric-patient-cluster-staging \
  --service-name epimetric-patient-nextjs-staging \
  --query 'taskArns[0]' \
  --output text | cut -d'/' -f3)

# コンテナに接続
aws ecs execute-command \
  --cluster epimetric-patient-cluster-staging \
  --task $TASK_ID \
  --container nextjs \
  --interactive \
  --command "/bin/sh"

# コンテナ内でシード実行
yarn db:push && yarn db:seed
```

### 方法2: ワンタイムタスク

```bash
./scripts/ecs-run-seed.sh staging
```

---

## トラブルシューティング

### Ctrl+Cでサーバーが停止しない

Dockerコンテナ内のPID 1問題です。以下のいずれかで対応：

```bash
# --initフラグを使用
docker run --init -p 3000:3000 epimetric-patient-app

# または別ターミナルから停止
docker stop <container_name>
```

### Tailwind CSSエラー（Cannot read properties of undefined）

Node.js 20では`@tailwindcss/postcss`と互換性問題があります。Node.js 22を使用してください。

### Prismaクライアントが初期化されていない

```bash
docker exec -it <container> yarn db:generate
```

### データベースに接続できない

- Docker Compose使用時: `DATABASE_URL`のホストは`db`
- docker run使用時: `DATABASE_URL`のホストは`host.docker.internal`

---

## 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | PostgreSQL接続URL | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | NextAuth.jsシークレット | `openssl rand -base64 32`で生成 |
| `AUTH_URL` | アプリケーションURL | `http://localhost:3000` |
| `NODE_ENV` | 環境 | `development` / `production` |

---

## ディレクトリ構成

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── dashboard/         # 患者ダッシュボード
│   ├── login/             # 患者ログイン
│   ├── mc/                # 医療センター管理
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── patients/
│   │   └── results/
│   └── results/           # 検査結果詳細
├── lib/                    # 共通ライブラリ
│   ├── auth.ts            # 認証設定
│   └── prisma.ts          # Prismaクライアント
├── prisma/                 # Prismaスキーマ・シード
├── scripts/                # ユーティリティスクリプト
├── terraform/              # インフラ定義
├── Dockerfile              # 開発用
├── Dockerfile.prod         # 本番用
└── docker-compose.yml      # ローカル開発環境
```
