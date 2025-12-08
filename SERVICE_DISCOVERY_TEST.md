# 🔍 Service Discovery テスト環境ガイド

## 概要

このドキュメントでは、**ECS Service Discovery**と同じ動作を開発環境でテストする方法を説明します。

## 🏗️ アーキテクチャ比較

### 通常の開発環境

```
ブラウザ ──直接──→ Backend API (localhost:3000)
         └─────→ Frontend (localhost:4000)
```

**特徴:**
- バックエンドが外部に公開される
- ブラウザから直接APIにアクセス可能
- 開発・デバッグが容易

---

### Service Discovery環境（本番と同じ）

```
ブラウザ ──→ Frontend (localhost:4000) ──Service Discovery──→ Backend (非公開)
              ↓
         API Proxy
              ↓
         Backend API (backend:3000)
```

**特徴:**
- バックエンドが外部非公開（コンテナ間通信のみ）
- すべてのAPI呼び出しはNext.js API Routesを経由
- 本番環境のECS Service Discoveryと同じ動作

---

## 🚀 Service Discovery環境のセットアップ

### 1. 環境の起動

```bash
# 既存の環境を停止（任意）
docker compose down

# Service Discovery環境を起動
docker compose -f docker-compose.service-discovery.yml up --build -d

# ログ確認
docker compose -f docker-compose.service-discovery.yml logs -f
```

### 2. テストデータの作成

```bash
# テスト用患者アカウントを作成
docker compose -f docker-compose.service-discovery.yml exec backend bundle exec rails db:seed
```

### 3. 動作確認

#### ✅ フロントエンドへのアクセス（成功するはず）

```bash
# フロントエンドは外部公開されている
curl http://localhost:4000/
```

ブラウザでアクセス: http://localhost:4000/login

#### ❌ バックエンドへの直接アクセス（失敗するはず）

```bash
# バックエンドは外部非公開なので接続できない
curl http://localhost:3000/api/v1/patients
# Expected: Connection refused
```

#### ✅ Next.js API Proxy経由でのアクセス（成功するはず）

```bash
# フロントエンド経由でバックエンドにアクセス
curl -X POST http://localhost:4000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🧪 テストケース

### テスト1: ログイン機能

**期待動作:**
- ブラウザからログインすると、Next.js API Proxyを経由してバックエンドに認証リクエストが送信される
- JWTトークンが返却され、ダッシュボードにリダイレクト

**手順:**
1. http://localhost:4000/login にアクセス
2. テストアカウントでログイン:
   - Email: `test@example.com`
   - Password: `password123`
3. ログインが成功し、ダッシュボードが表示されることを確認

**確認ポイント:**
- ブラウザのDevTools → Networkタブで、リクエストが `/api/v1/login` に送信されていることを確認
- バックエンドに直接アクセスしていないことを確認

---

### テスト2: 患者情報取得

**期待動作:**
- ダッシュボードで患者情報が正しく表示される
- すべてのAPI呼び出しがNext.js経由で行われる

**手順:**
1. ログイン後、ダッシュボードにアクセス
2. DevTools → Networkタブで以下を確認:
   - `/api/v1/patients/me` へのリクエスト
   - `/api/v1/blood_test_results` へのリクエスト
3. すべてのリクエストが `localhost:4000/api/*` に送信されていることを確認

---

### テスト3: バックエンド直接アクセスの遮断

**期待動作:**
- バックエンドに直接アクセスしようとすると接続エラーが発生

**手順:**
```bash
# ターミナルから直接バックエンドにアクセスを試みる
curl http://localhost:3000/api/v1/patients

# 期待される結果: Connection refused または timeout
```

---

## 📊 ログの確認

### フロントエンド（Next.js）のログ

```bash
docker compose -f docker-compose.service-discovery.yml logs -f frontend
```

**確認すべき内容:**
```
[API Proxy] POST /api/v1/login -> http://backend:3000/api/v1/login
[API Proxy] Response: 200 OK
[API Proxy] GET /api/v1/patients/me -> http://backend:3000/api/v1/patients/me
[API Proxy] Response: 200 OK
```

### バックエンド（Rails）のログ

```bash
docker compose -f docker-compose.service-discovery.yml logs -f backend
```

**確認すべき内容:**
```
Started POST "/api/v1/login" for 172.x.x.x at 2025-12-08 ...
Processing by Api::V1::SessionsController#create as HTML
Completed 200 OK in 1000ms
```

**重要:** IPアドレスが `172.x.x.x` （Docker内部ネットワーク）になっていることを確認
→ `192.168.x.x` や `127.0.0.1` の場合は、外部から直接アクセスされている

---

## 🔄 環境の切り替え

### 通常の開発環境に戻す

```bash
# Service Discovery環境を停止
docker compose -f docker-compose.service-discovery.yml down

# 通常の開発環境を起動
docker compose up -d
```

### 両方の環境で動作確認

```bash
# 1. 通常の開発環境でテスト
docker compose up -d
# テスト実行...
docker compose down

# 2. Service Discovery環境でテスト
docker compose -f docker-compose.service-discovery.yml up -d
# テスト実行...
docker compose -f docker-compose.service-discovery.yml down
```

---

## 🐛 トラブルシューティング

### 問題1: バックエンドに接続できない

**症状:**
```
[API Proxy] Error: connect ECONNREFUSED backend:3000
```

**原因:** バックエンドコンテナが起動していない

**解決策:**
```bash
# コンテナの状態を確認
docker compose -f docker-compose.service-discovery.yml ps

# バックエンドのログを確認
docker compose -f docker-compose.service-discovery.yml logs backend

# 再起動
docker compose -f docker-compose.service-discovery.yml restart backend
```

---

### 問題2: CORS エラーが発生

**症状:**
```
Access to fetch at 'http://localhost:4000/api/v1/login' has been blocked by CORS policy
```

**原因:** CORS設定が不正

**解決策:**

1. バックエンドのCORS設定を確認:

```ruby
# backend/config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:4000"  # ← フロントエンドのURL
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

2. バックエンドを再起動:
```bash
docker compose -f docker-compose.service-discovery.yml restart backend
```

---

### 問題3: API Proxyが動作しない

**症状:**
- `/api/v1/login` へのリクエストが404エラーになる

**原因:** Next.js API Routeが正しく配置されていない

**解決策:**

1. ファイルの配置を確認:
```bash
ls -la frontend/app/api/[...proxy]/route.ts
```

2. フロントエンドを再ビルド:
```bash
docker compose -f docker-compose.service-discovery.yml up --build frontend
```

---

## 📚 技術的詳細

### Docker Composeのネットワーク設定

```yaml
networks:
  app-network:
    driver: bridge
```

- すべてのコンテナが同じネットワーク内に配置
- コンテナ名でDNS解決が可能（`backend`, `frontend`, `db`）
- ECS Service DiscoveryのCloud Mapと同じ動作

### Next.js API Proxyの仕組み

```typescript
// フロントエンドのAPIクライアント
const response = await fetch('/api/v1/login', { ... });

// ↓ Next.js API Route [/app/api/[...proxy]/route.ts]

// ↓ バックエンドにプロキシ
const backendResponse = await fetch('http://backend:3000/api/v1/login', { ... });
```

**利点:**
- ブラウザからバックエンドへの直接アクセスを防ぐ
- 認証トークンをサーバーサイドで安全に管理
- 本番環境のService Discoveryと同じフロー

---

## 🎯 本番環境との対応

| 項目 | Service Discovery環境 | AWS本番環境 |
|------|----------------------|------------|
| フロントエンド公開 | `localhost:4000` | ALB経由 |
| バックエンド公開 | 非公開（expose） | 非公開（VPC内） |
| サービス間通信 | Docker DNS (`backend:3000`) | Cloud Map (`backend.local:3000`) |
| API プロキシ | Next.js API Routes | Next.js API Routes |
| ネットワーク | Bridge network | VPC Private Subnet |

---

## ✅ チェックリスト

開発環境でService Discoveryをテストする前に確認:

- [ ] 通常の開発環境が正常に動作している
- [ ] Docker Composeが正しくインストールされている
- [ ] `docker-compose.service-discovery.yml` が存在する
- [ ] `frontend/app/api/[...proxy]/route.ts` が存在する
- [ ] ポート4000が使用可能である

テスト実行時の確認:

- [ ] バックエンドが外部から直接アクセスできない
- [ ] フロントエンド経由でAPIにアクセスできる
- [ ] ログインが正常に動作する
- [ ] ダッシュボードが正しく表示される
- [ ] ログにプロキシの動作が記録されている

---

## 📖 関連ドキュメント

- [メインREADME](./README.md) - プロジェクト全体の説明
- [LOGIN_INFO.md](./LOGIN_INFO.md) - テストアカウント情報
- [terraform/service_discovery.tf](./terraform/service_discovery.tf) - 本番環境のService Discovery設定

---

**最終更新日**: 2025-12-08

