# Epimetric Patient App

患者向け血液検査結果閲覧アプリケーション

## 概要
# Epimetric Patient App

患者向け血液検査結果閲覧アプリケーション

## 概要

患者が自身の血液検査結果をオンラインで確認できるWebアプリケーションです。
医療機関スタッフはCSVファイルで検査結果を一括アップロードできます。
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

## 環境構築

### 前提条件

以下がインストールされていること：

- Node.js 20.x 以上
- Yarn 1.22.x 以上
- Docker Desktop

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd epimetric-patient-app
```

### 2. データベースの起動
### 2. データベースの起動

```bash
docker compose up -d
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

`.env` ファイルの内容（デフォルトで開発環境用に設定済み）：

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
# or
pnpm dev
# or
bun dev
```

アプリケーションが http://localhost:3000 で起動します。

---

## ログイン情報（テストユーザー）

| ユーザー種別 | URL | メール | パスワード |
|-------------|-----|--------|-----------|
| 患者 | http://localhost:3000/login | `test@example.com` | `password123` |
| 医療機関スタッフ | http://localhost:3000/mc/login | `staff@example.com` | `staff123` |

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

### SSR + Server Actions

このアプリケーションはNext.js App Routerを使用し、以下の構成で動作します：

- **Server Components**: ページはサーバーサイドでレンダリング
- **Server Actions**: データの作成・更新はServer Actionsで直接DB操作
- **Prisma**: データベースへの直接アクセス
- **NextAuth.js**: セッションベースの認証

```
[ブラウザ] → [Next.js Server] → [PostgreSQL]
              ↑
           Server Components
           Server Actions
           Prisma ORM
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

---

## ライセンス

Private
Private
