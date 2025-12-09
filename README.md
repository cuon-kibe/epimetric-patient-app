# Epimetric Patient App

患者向け血液検査結果閲覧アプリケーション

## 概要

患者が自身の血液検査結果をオンラインで確認できるWebアプリケーションです。
医療機関スタッフはCSVファイルで検査結果を一括アップロードできます。

### 主な機能

- **患者向け**
  - ログイン/新規登録
  - 血液検査結果の一覧表示
  - 検査結果の詳細確認

- **医療機関スタッフ向け**
  - スタッフログイン
  - 患者一覧の確認
  - 検査結果のCSV一括アップロード

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| データベース | PostgreSQL 16 |
| ORM | Prisma |
| 認証 | NextAuth.js v5 |
| スタイリング | Tailwind CSS |
| コンテナ | Docker / Docker Compose |

---

## クイックスタート

```bash
# 1. DBを起動
docker compose up -d

# 2. フロントエンドセットアップ
cd frontend
yarn install
cp env.local.example .env
yarn db:generate
yarn db:push
yarn db:seed

# 3. 開発サーバー起動
yarn dev
```

http://localhost:3000 でアクセス可能になります。

---

## ログイン情報（テストユーザー）

| ユーザー種別 | URL | メール | パスワード |
|-------------|-----|--------|-----------|
| 患者 | http://localhost:3000/login | `test@example.com` | `password123` |
| 医療機関スタッフ | http://localhost:3000/mc/login | `staff@example.com` | `staff123` |

---

## 環境構築（詳細）

### 前提条件

- Node.js 20.x 以上
- Yarn 1.22.x 以上
- Docker Desktop

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd epimetric-patient-app
```

### 2. データベースの起動

```bash
docker compose up -d
```

PostgreSQLが `localhost:5432` で起動します。

### 3. フロントエンドのセットアップ

```bash
cd frontend
```

#### 3.1. 依存パッケージのインストール

```bash
yarn install
```

#### 3.2. 環境変数の設定

```bash
cp env.local.example .env
```

`.env` ファイルの内容：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/epimetric_patient_dev"
AUTH_SECRET="your-secret-key-change-in-production"
AUTH_URL="http://localhost:3000"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 3.3. Prismaクライアントの生成

```bash
yarn db:generate
```

#### 3.4. データベースのマイグレーション

```bash
yarn db:push
```

#### 3.5. シードデータの投入

```bash
yarn db:seed
```

### 4. 開発サーバーの起動

```bash
yarn dev
```

---

## 動作確認ガイド

### 現在の構成（Next.js フルスタック + Prisma）

#### 確認手順

```bash
# 1. DBを起動
docker compose up -d

# 2. アプリを起動
cd frontend
yarn dev

# 3. ブラウザで確認
open http://localhost:3000
```

#### 確認項目

| # | 確認項目 | 手順 | 期待結果 |
|---|---------|------|---------|
| 1 | **患者ログイン** | `/login` で `test@example.com` / `password123` | ダッシュボードにリダイレクト |
| 2 | **患者登録** | `/register` で新規登録 | ダッシュボードにリダイレクト |
| 3 | **検査結果一覧** | `/dashboard` にアクセス | 検査結果が表示される |
| 4 | **検査結果詳細** | 一覧から詳細をクリック | 詳細ページが表示される |
| 5 | **スタッフログイン** | `/mc/login` で `staff@example.com` / `staff123` | 管理ダッシュボードにリダイレクト |
| 6 | **患者一覧** | `/mc/patients` | 登録患者が表示される |
| 7 | **CSVアップロード** | `/mc/results/upload` でCSVアップロード | 検査結果が登録される |

#### Prisma Studio でデータ確認

```bash
cd frontend
yarn db:studio
# http://localhost:5555 でDBをGUI確認
```

#### ターミナルでPrismaクエリログを確認

開発サーバーのターミナルに `prisma:query` ログが表示されます：

```
prisma:query SELECT "public"."patients"."id", ...
prisma:query INSERT INTO "public"."blood_test_results" ...
```

---

### 参考：旧構成（Rails API + Next.js + ECS Service Discovery）

> **注意**: この構成は現在使用していません。過去の動作確認記録として残しています。

#### ECS Service Discovery シミュレーション構成図

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                          │
│                                                            │
│  ┌─────────────┐        ┌─────────────┐                   │
│  │  frontend   │───────▶│   backend   │                   │
│  │  (Next.js)  │ HTTP   │   (Rails)   │                   │
│  │  Port:4000  │        │  Port:3000  │ ← 外部非公開      │
│  └──────┬──────┘        └──────┬──────┘                   │
│         │                      │                          │
│         │                      ▼                          │
│         │               ┌─────────────┐                   │
│         │               │     db      │                   │
│         │               │ (PostgreSQL)│                   │
│         │               └─────────────┘                   │
└─────────│──────────────────────────────────────────────────┘
          │
          ▼ (外部公開)
    ┌───────────┐
    │  Browser  │
    │ localhost │
    │   :4000   │
    └───────────┘
```

#### 動作確認で検証したこと

| # | 検証項目 | 結果 |
|---|---------|------|
| 1 | **バックエンドがDockerネットワーク内でのみアクセス可能** | ✅ `backend:3000` で内部通信成功 |
| 2 | **バックエンドが外部から直接アクセス不可** | ✅ `localhost:3000` は接続拒否 |
| 3 | **フロントエンドがSSRでバックエンドAPIを呼び出し** | ✅ Server Componentsから `http://backend:3000` で通信 |
| 4 | **ブラウザからはフロントエンド経由のみ** | ✅ `/api/*` プロキシ経由でアクセス |

#### 旧構成の環境変数

```env
# フロントエンド (frontend/.env)
API_URL=http://backend:3000              # SSR用（内部通信）
NEXT_PUBLIC_API_URL=http://localhost:4000 # CSR用（プロキシ経由）
```

#### 旧構成のDocker Compose (参考)

```yaml
# docker-compose.service-discovery.yml (削除済み)
services:
  backend:
    expose:
      - "3000"  # ポート公開なし（内部のみ）
    # ports: なし

  frontend:
    ports:
      - "4000:4000"  # 外部公開
    environment:
      API_URL: http://backend:3000
```

#### ECS Service Discovery とは

AWS ECS環境で、サービス間通信を実現する仕組み：

```
[Internet] → [ALB] → [Next.js (ECS)]
                           ↓
                    Service Discovery
                           ↓
                    [Rails API (ECS)] ← 外部非公開
                           ↓
                    [RDS PostgreSQL]
```

**メリット:**
- Rails APIを直接インターネットに公開しない
- VPC内部通信で高速（1-2ms）
- ALB 1台で済む（コスト削減）

---

## 利用可能なコマンド

### 開発

| コマンド | 説明 |
|----------|------|
| `yarn dev` | 開発サーバーを起動 |
| `yarn build` | 本番用ビルドを作成 |
| `yarn start` | 本番サーバーを起動 |
| `yarn lint` | ESLintを実行 |

### データベース

| コマンド | 説明 |
|----------|------|
| `yarn db:generate` | Prismaクライアントを生成 |
| `yarn db:push` | スキーマをDBに反映（開発用） |
| `yarn db:migrate` | マイグレーションを実行 |
| `yarn db:studio` | Prisma Studioを起動（GUI） |
| `yarn db:seed` | シードデータを投入 |

### Docker

| コマンド | 説明 |
|----------|------|
| `docker compose up -d` | DBコンテナを起動 |
| `docker compose down` | DBコンテナを停止 |
| `docker compose logs -f db` | DBのログを表示 |

---

## ディレクトリ構成

```
epimetric-patient-app/
├── docker-compose.yml          # Docker Compose設定（DBのみ）
├── README.md                   # このファイル
│
└── frontend/                   # Next.jsアプリケーション
    ├── app/                    # App Router
    │   ├── page.tsx            # ルートページ
    │   ├── login/              # 患者ログイン
    │   ├── register/           # 患者登録
    │   ├── dashboard/          # 患者ダッシュボード
    │   ├── results/[id]/       # 検査結果詳細
    │   ├── mc/                 # 医療機関管理画面
    │   │   ├── login/          # スタッフログイン
    │   │   ├── dashboard/      # スタッフダッシュボード
    │   │   ├── patients/       # 患者一覧
    │   │   └── results/        # 検査結果管理
    │   ├── actions/            # Server Actions
    │   └── api/                # API Routes
    │
    ├── lib/                    # ライブラリ
    │   ├── auth.ts             # NextAuth.js設定
    │   └── prisma.ts           # Prismaクライアント
    │
    ├── prisma/                 # Prisma
    │   ├── schema.prisma       # スキーマ定義
    │   └── seed.ts             # シードデータ
    │
    ├── package.json
    ├── .env                    # 環境変数（gitignore）
    └── env.local.example       # 環境変数テンプレート
```

---

## アーキテクチャ

### 現在の構成（SSR + Server Actions）

```
[ブラウザ] → [Next.js Server] → [PostgreSQL]
              ↑
           Server Components
           Server Actions
           Prisma ORM
```

- **Server Components**: ページはサーバーサイドでレンダリング
- **Server Actions**: データの作成・更新はServer Actionsで直接DB操作
- **Prisma**: データベースへの直接アクセス
- **NextAuth.js**: セッションベースの認証

### 本番環境推奨構成（AWS Amplify）

```
[CloudFront] → [Amplify Hosting] → [RDS PostgreSQL]
                    ↑
              Next.js SSR
              Prisma ORM
```

---

## CSVフォーマット

医療機関スタッフがアップロードするCSVのフォーマット：

```csv
患者メール,患者名,検査日,項目名,結果値,単位,基準値下限,基準値上限
test@example.com,山田太郎,2024-01-15,WBC,5.2,10^3/μL,3.5,9.0
test@example.com,山田太郎,2024-01-15,RBC,4.5,10^6/μL,4.0,5.5
test@example.com,山田太郎,2024-01-15,HGB,14.0,g/dL,13.0,17.0
```

---

## トラブルシューティング

### DBに接続できない

```bash
# DBコンテナの状態を確認
docker compose ps

# DBを再起動
docker compose restart db
```

### Prismaエラーが発生する

```bash
# Prismaクライアントを再生成
yarn db:generate

# スキーマを再同期
yarn db:push
```

### シードデータをリセットしたい

```bash
# DBをリセットしてシードを再実行
docker compose down -v
docker compose up -d
yarn db:push
yarn db:seed
```

### ログインできない

シードデータのパスワードが更新されていない可能性があります：

```bash
# シードを再実行
yarn db:seed

# または直接DBでパスワードをリセット
docker exec <container> psql -U postgres -d epimetric_patient_dev \
  -c "UPDATE patients SET password_hash = '...' WHERE email = 'test@example.com';"
```

---

## ライセンス

Private
