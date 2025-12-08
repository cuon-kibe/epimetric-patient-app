# 🔍 ECS Service Discovery 技術的評価と決定記録

## 決定事項: ECS Service Discoveryの採用

本プロジェクトでは、Rails APIへのアクセスにAWS Cloud Map (Service Discovery) を使用します。

---

## 📊 MECE分析：サービス間通信パターンの分類

### パターンA: Service Discovery（現在の構成）

```
Internet → ALB → Next.js Container → Service Discovery (rails-api.local) → Rails Container
```

**特徴:**
- Rails APIが外部非公開
- VPC内部DNS（Cloud Map）で名前解決
- コンテナ間直接通信
- セキュリティグループで通信制御

---

### パターンB: ALB経由通信

```
Internet → ALB (Frontend) → Next.js Container
                          ↓
Internet → ALB (Backend) → Rails Container
```

**特徴:**
- Rails APIも独立したALBで公開
- 2つのALBが必要
- ALBのヘルスチェック機能を活用
- パブリックエンドポイントが2つ

---

### パターンC: 同一ALB・パスルーティング

```
Internet → ALB → /         → Next.js Container
              → /api/*    → Rails Container
```

**特徴:**
- 1つのALBで両方のサービスを公開
- パスベースルーティング
- Rails APIが外部アクセス可能
- シンプルな構成

---

### パターンD: APIゲートウェイ経由

```
Internet → API Gateway → Next.js / Rails
```

**特徴:**
- マネージドサービス活用
- 高機能（認証、スロットリング等）
- コストが高い
- オーバーキルになる可能性

---

## 🎯 5-Why根本原因分析

### Why 1: なぜService Discoveryを使用するのか？

**回答**: Rails APIを外部に公開したくないため

### Why 2: なぜRails APIを外部に公開したくないのか？

**回答**: セキュリティリスクを最小化し、攻撃面を減らすため

### Why 3: なぜセキュリティリスクを最小化する必要があるのか？

**回答**: 
- 患者の医療情報（血液検査結果）を扱う機密性の高いアプリケーション
- 個人情報保護法・医療情報保護の観点
- 不正アクセスのリスクを低減

### Why 4: なぜAPIを外部に公開すると攻撃面が増えるのか?

**回答**:
- 認証をバイパスした直接アクセスの可能性
- DDoS攻撃の標的になりやすい
- APIエンドポイントの列挙・探索攻撃
- フロントエンド認証レイヤーを経由しない攻撃

### Why 5 (Root Cause): なぜフロントエンドを経由しない攻撃を防ぐ必要があるのか？

**根本原因**: 
本アプリケーションは**SSR (Server-Side Rendering) を使用する構成**であり、すべてのAPI呼び出しはNext.jsサーバー経由で行われる設計になっている。この設計において、Rails APIを直接インターネットに公開する必要性がなく、むしろVPC内部に閉じ込めることで、セキュリティ層を一元化し、Next.jsでの認証・認可チェックを必須とする防御in-depthアーキテクチャを実現できる。

---

## 💡 技術的決定記録（TDR）

### 理由 (Rationale)

#### 技術的要因

1. **SSR構成の特性**
   - Next.jsがSSRを使用するため、ブラウザから直接APIアクセスしない
   - すべてのAPI呼び出しはNext.jsサーバー経由
   - Service Discoveryがアーキテクチャに自然にフィット

2. **セキュリティ強化**
   - Rails APIを外部非公開にできる
   - 攻撃面の最小化（Single Point of Entry）
   - セキュリティグループで厳密なアクセス制御

3. **パフォーマンス**
   - VPC内部通信で低レイテンシ
   - ALBのオーバーヘッドがない
   - TCP直接通信で高速

4. **コスト最適化**
   - ALBが1つで済む（2つ目不要）
   - ALB料金: $0.0225/時間 × 730時間/月 ≈ $16.4/月の節約
   - データ転送料の削減

#### ビジネス要因

1. **医療情報保護**
   - 患者の血液検査結果という機密情報を扱う
   - セキュリティ要件が高い
   - 外部公開エンドポイントを最小化

2. **コンプライアンス**
   - 個人情報保護法対応
   - 医療情報システム安全管理ガイドライン対応
   - アクセスログの一元化

#### コンテキスト

- フロントエンドとバックエンドが分離された構成
- SSRを使用（CSRメインではない）
- 将来的なマイクロサービス化の可能性
- AWSインフラ使用

---

### 代替案 (Alternatives Considered)

#### 代替案1: ALB経由通信（2つのALB）

**メリット:**
- 管理画面などから直接APIアクセス可能
- ALBのヘルスチェック、WAF統合
- 一般的な構成で理解しやすい

**デメリット:**
- コストが高い（ALB追加で月$16以上）
- Rails APIが外部公開される（セキュリティリスク）
- レイテンシの増加
- 認証バイパスのリスク

**却下理由**: 
- セキュリティ要件を満たさない
- コストメリットがない
- SSR構成で外部公開の必要性なし

---

#### 代替案2: 同一ALB・パスルーティング

**メリット:**
- ALBが1つで済む
- 設定がシンプル
- 一般的なパターン

**デメリット:**
- Rails APIが外部アクセス可能（セキュリティリスク）
- パスベースルーティングの制約
- フロントエンドとバックエンドのパスが衝突する可能性

**却下理由**:
- Rails APIを外部公開したくない（最大の理由）
- SSR構成では不要な公開
- セキュリティ要件を満たさない

---

#### 代替案3: API Gateway経由

**メリット:**
- 認証、スロットリング、キャッシュなど高機能
- マネージドサービス
- モニタリング充実

**デメリット:**
- コストが非常に高い
- API Gateway料金: $3.50/百万リクエスト
- オーバーキル（不要な機能が多い）
- 設定が複雑

**却下理由**:
- コストパフォーマンスが悪い
- このアプリケーションには機能が過剰
- Service Discoveryで十分

---

### 適用範囲 (Applicable Scenarios)

#### Service Discoveryを使用すべき状況

✅ **適用すべき:**
1. SSRを使用するフロントエンド・バックエンド分離構成
2. バックエンドAPIを外部公開したくない場合
3. VPC内部でのサービス間通信
4. マイクロサービスアーキテクチャ
5. 医療・金融など機密性の高いデータを扱う場合
6. コスト最適化が重要な場合

❌ **適用すべきでない:**
1. CSR（Client-Side Rendering）メインの構成
2. モバイルアプリから直接APIアクセスする場合
3. 外部サービスからのWebhook受信が必要な場合
4. 管理画面など外部から直接APIアクセスが必要な場合
5. チーム全体がService Discoveryに不慣れで学習コストが高い場合

#### 判断基準

```
Service Discoveryを使用する判断フローチャート:

1. SSRを使用している？
   YES → 次へ
   NO → ALB経由推奨

2. バックエンドを外部公開する必要がある？
   NO → Service Discovery推奨
   YES → 次へ

3. 外部公開が必要なのは一部のエンドポイントのみ？
   YES → ハイブリッド構成（Service Discovery + 一部ALB）
   NO → ALB経由推奨

4. セキュリティ要件が高い？
   YES → Service Discovery強く推奨
   NO → どちらでも可
```

---

### 使用例 (Usage Examples)

#### 基本的な使用例

```typescript
// frontend/lib/api/client.ts

const getBaseURL = () => {
  if (typeof window === 'undefined') {
    // SSR: Service Discovery経由
    return process.env.API_URL || 'http://rails-api.local:3000';
  }
  // CSR: Next.js API Routes経由（プロキシ）
  return '/api';
};
```

#### 応用例1: マイクロサービス構成

複数のバックエンドサービスがある場合:

```hcl
# terraform/service_discovery.tf

# ユーザーサービス
resource "aws_service_discovery_service" "user_service" {
  name = "user-service"
  # ...
}

# 支払いサービス
resource "aws_service_discovery_service" "payment_service" {
  name = "payment-service"
  # ...
}

# 通知サービス
resource "aws_service_discovery_service" "notification_service" {
  name = "notification-service"
  # ...
}
```

Next.jsから各サービスにアクセス:
```typescript
const userService = 'http://user-service.local:3000';
const paymentService = 'http://payment-service.local:4000';
const notificationService = 'http://notification-service.local:5000';
```

#### 応用例2: ハイブリッド構成

一部のエンドポイントのみ外部公開が必要な場合:

```
Internet → ALB (Webhook用) → Rails Container (特定エンドポイントのみ)
Next.js → Service Discovery → Rails Container (通常のAPI)
```

```hcl
# terraform/alb.tf

# Webhook専用ALB
resource "aws_lb" "webhook" {
  name               = "webhook-alb"
  internal           = false
  # ...
}

# Webhook専用ターゲットグループ
resource "aws_lb_target_group" "webhook" {
  # パスパターンで /webhooks/* のみ許可
}
```

---

### 注意点 (Considerations)

#### 制限事項

1. **DNS解決の遅延**
   - TTL設定に注意（推奨: 5秒）
   - コンテナ起動・停止時の反映時間

2. **デバッグの難しさ**
   - VPC内部通信のため外部からアクセス不可
   - CloudWatch Logsでのログ確認が必須
   - 開発環境でのシミュレーションが重要

3. **初期設定の複雑さ**
   - Terraformでの設定が必要
   - セキュリティグループの正確な設定が必須
   - チームの学習曲線

#### リスク

1. **Service Discovery障害**
   - **リスク**: Cloud Mapサービスの障害
   - **軽減策**: AWSのSLA（99.9%）、マルチAZ構成

2. **ネットワーク設定ミス**
   - **リスク**: セキュリティグループの設定ミスで通信不可
   - **軽減策**: Terraformでのコード管理、自動テスト

3. **コスト増加の可能性**
   - **リスク**: Service Discoveryの料金（$0.50/Hosted Zone/月）
   - **軽減策**: 1つの名前空間で複数サービスを管理

#### メンテナンス

1. **定期的な確認事項**
   - Cloud Mapのヘルスチェック状態
   - DNS解決の動作確認
   - セキュリティグループルールの見直し

2. **アップデート時の注意**
   - タスク定義更新時のDNS反映確認
   - ローリングアップデート時のDNS TTL考慮

#### パフォーマンス

1. **レイテンシ**
   - VPC内部通信: 1-2ms
   - ALB経由: 5-10ms
   - **Service Discoveryの方が高速**

2. **スループット**
   - VPC内部ネットワーク帯域幅を利用
   - ALBのリクエスト数制限なし

---

### 関連パターン (Related Patterns)

#### 組み合わせると効果的

1. **VPC Endpoint (PrivateLink)**
   - S3、RDSなどAWSサービスへのアクセスもVPC内部化
   - セキュリティ強化とコスト削減

2. **ALB + WAF**
   - フロントエンド用ALBにWAFを設定
   - DDoS対策、SQLインジェクション対策

3. **CloudWatch Container Insights**
   - Service Discovery環境の詳細モニタリング
   - パフォーマンス問題の早期発見

#### 競合する可能性

1. **CSR（Client-Side Rendering）**
   - ブラウザから直接APIアクセスが必要
   - Service Discoveryが使えない（プロキシが必要）

2. **モバイルアプリ**
   - モバイルアプリから直接APIアクセス
   - Rails APIを外部公開する必要がある

#### 発展形

1. **Service Mesh（AWS App Mesh）**
   - より高度なサービス間通信制御
   - リトライ、タイムアウト、サーキットブレーカー
   - オブザーバビリティの向上

2. **マルチリージョン構成**
   - グローバルサービスディスカバリー
   - Route 53との統合
   - 災害対策

---

## 📈 コスト比較

### Service Discovery構成（現在）

```
ALB (1台):              $16.4/月
Cloud Map:              $0.50/月
-----------------------------------
合計:                   $16.9/月
```

### ALB経由構成（代替案1）

```
ALB (Frontend用):       $16.4/月
ALB (Backend用):        $16.4/月
-----------------------------------
合計:                   $32.8/月

差額: +$15.9/月 (約2倍)
```

### 同一ALBパスルーティング（代替案2）

```
ALB (1台):              $16.4/月
-----------------------------------
合計:                   $16.4/月

差額: -$0.5/月
```

**結論**: コストの観点では同一ALBが最安だが、セキュリティ要件を考慮するとService Discoveryが最適。

---

## 🎯 ベストプラクティス判定

### このプロジェクトでの判定: ✅ **YES - ベストプラクティス**

**根拠:**

1. ✅ **アーキテクチャとの整合性**
   - SSR構成に完全マッチ
   - 外部公開の必要性なし

2. ✅ **セキュリティ要件**
   - 医療情報を扱う
   - 攻撃面の最小化が必須
   - 防御in-depthアーキテクチャ

3. ✅ **コストパフォーマンス**
   - ALB 2台構成より安価
   - 機能に対して適正コスト

4. ✅ **スケーラビリティ**
   - 将来のマイクロサービス化に対応
   - 新サービス追加が容易

5. ✅ **パフォーマンス**
   - 低レイテンシ
   - 高スループット

---

### 一般的なケースでの判定: ⚠️ **ケースバイケース**

Service Discoveryが適切かどうかは以下の要素で判断:

| 要素 | Service Discovery推奨 | ALB推奨 |
|------|----------------------|---------|
| レンダリング | SSR | CSR |
| セキュリティ要件 | 高 | 低〜中 |
| 外部公開の必要性 | なし | あり |
| チームの習熟度 | 高 | 低〜中 |
| コスト重視度 | 高 | 中 |
| アーキテクチャ複雑度許容度 | 高 | 低 |

---

## 🚀 実装チェックリスト

本プロジェクトでService Discoveryを正しく実装するための確認項目:

### インフラ設定

- [x] Cloud Map名前空間の作成（`local`）
- [x] Service Discoveryサービスの作成（`rails-api`）
- [x] ECSサービスへのService Registry統合
- [x] セキュリティグループの適切な設定
- [x] VPCサブネット構成の確認

### アプリケーション設定

- [x] Next.jsでのAPI URL設定（`rails-api.local:3000`）
- [x] 環境変数の適切な設定
- [x] API Proxyの実装（CSR対応）
- [x] エラーハンドリングの実装

### テスト・監視

- [x] 開発環境でのService Discoveryシミュレーション
- [ ] 本番環境でのエンドツーエンドテスト
- [ ] CloudWatch Logsの設定
- [ ] CloudWatch Alarmの設定
- [ ] ヘルスチェックの動作確認

### ドキュメント

- [x] アーキテクチャ図の作成
- [x] 技術的決定記録（このドキュメント）
- [x] 開発環境テスト手順
- [ ] 運用手順書
- [ ] トラブルシューティングガイド

---

## 📚 参考資料

### AWS公式ドキュメント

- [AWS Cloud Map - Service Discovery](https://docs.aws.amazon.com/cloud-map/)
- [ECS Service Discovery](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-discovery.html)
- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)

### ベストプラクティス

- [ECS Best Practices - Networking](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking.html)
- [Microservices on AWS](https://aws.amazon.com/microservices/)

### 関連プロジェクトドキュメント

- [README.md](./README.md)
- [SERVICE_DISCOVERY_TEST.md](./SERVICE_DISCOVERY_TEST.md)
- [terraform/service_discovery.tf](./terraform/service_discovery.tf)

---

**最終更新日**: 2025-12-08  
**レビュー者**: -  
**承認者**: -

