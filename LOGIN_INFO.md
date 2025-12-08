# 🔐 患者マイページ ログイン情報

## テスト用アカウント

開発環境・デモ用のテストアカウント情報です。

### ログイン情報

| 項目 | 値 |
|------|-----|
| **メールアドレス** | `test@example.com` |
| **パスワード** | `password123` |
| **患者名** | 山田太郎 |
| **生年月日** | 1990-01-01 |

### アクセスURL

- **患者マイページ（ログイン画面）**: http://localhost:4000/login
- **新規登録画面**: http://localhost:4000/register
- **バックエンドAPI**: http://localhost:3000

---

## 初回セットアップ手順

### 1. Docker環境の起動

```bash
# プロジェクトディレクトリに移動
cd epimetric-patient-app

# コンテナをビルド・起動
docker compose up --build -d

# ログを確認（起動完了まで待つ）
docker compose logs -f
```

### 2. テストデータの作成

```bash
# テスト用患者アカウントを作成
docker compose exec backend bundle exec rails db:seed
```

出力例:
```
Creating test patient data...
Test patient created:
  Email: test@example.com
  Password: password123
  Name: 山田太郎

You can login at http://localhost:4000/login
```

### 3. ログイン

1. ブラウザで http://localhost:4000/login にアクセス
2. 上記のメールアドレスとパスワードを入力
3. 「ログイン」ボタンをクリック
4. ダッシュボード画面にリダイレクトされます

---

## API動作確認

### ログインAPI

```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

成功時のレスポンス:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "patient": {
    "id": 1,
    "email": "test@example.com",
    "name": "山田太郎",
    "date_of_birth": "1990-01-01"
  }
}
```

---

## 新規患者アカウントの作成

テストアカウント以外に、新しい患者アカウントを作成することもできます。

### 方法1: Webページから登録

1. http://localhost:4000/register にアクセス
2. 必要な情報を入力:
   - メールアドレス
   - パスワード
   - パスワード確認
   - 氏名
   - 生年月日
3. 「登録」ボタンをクリック

### 方法2: API経由で登録

```bash
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "email": "newpatient@example.com",
      "password": "securepassword",
      "password_confirmation": "securepassword",
      "name": "新規患者",
      "date_of_birth": "1995-06-15"
    }
  }'
```

---

## トラブルシューティング

### ログインできない場合

**症状**: ログインに失敗する

**原因と対処法**:

1. **テストデータが作成されていない**
   ```bash
   docker compose exec backend bundle exec rails db:seed
   ```

2. **バックエンドが起動していない**
   ```bash
   docker compose ps
   # backend, frontend, db の3つがUpになっているか確認
   ```

3. **メールアドレスまたはパスワードが間違っている**
   - メールアドレス: `test@example.com`
   - パスワード: `password123`
   - 大文字小文字を確認

### データベースをリセットしたい場合

```bash
# すべてのコンテナとボリュームを削除
docker compose down -v

# 再度起動とデータ作成
docker compose up -d
docker compose exec backend bundle exec rails db:create db:migrate db:seed
```

---

## セキュリティに関する注意事項

⚠️ **重要**: このログイン情報は**開発・テスト環境専用**です。

- 本番環境では絶対に使用しないでください
- 本番環境では強力なパスワードを使用してください
- 本番環境ではこのファイルを削除または`.gitignore`に追加してください

---

## 関連ドキュメント

- [メインREADME](./README.md) - プロジェクト全体の説明
- [フロントエンドREADME](./frontend/README.md) - Next.jsアプリケーションの詳細
- [バックエンドREADME](./backend/README.md) - Rails APIの詳細

---

**最終更新日**: 2025-12-08

