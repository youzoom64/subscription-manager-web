# 📊 データベース構築ガイド

## 🔍 現在の問題と解決策

### 問題の根本原因

`sinchoku.html`で報告されている「新規サブスクリプション追加しても表示されない」問題は、以下が原因でした：

1. **API エンドポイントが不足** - フロントエンドがデータベースに直接アクセスしようとしていた
2. **データフロー設計の問題** - ローカルステートとデータベースの同期が取れていない
3. **環境変数の設定不備** - データベース接続設定が不完全

### ✅ 実装した解決策

#### 1. API エンドポイントの作成

- `src/app/api/subscriptions/route.ts` - GET/POST
- `src/app/api/subscriptions/[id]/route.ts` - PUT/DELETE
- `src/app/api/payment-cards/route.ts` - GET/POST

#### 2. クライアントサイド API クライアント

- `src/lib/apiClient.ts` - API との通信を統一管理

#### 3. フロントエンド更新

- 直接データベースアクセスから API 経由に変更
- エラーハンドリングの強化

## 🛠️ セットアップ手順

### 1. 環境変数設定

`.env.local` ファイルを作成:

```bash
# NextAuth.js設定
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth設定
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# データベース設定（PostgreSQL推奨）
DATABASE_URL="postgresql://username:password@localhost:5432/subscription_manager"
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/subscription_manager"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/subscription_manager"
```

### 2. 自動セットアップ（推奨）

```bash
npm run db:setup
```

### 3. 手動セットアップ

```bash
# Prismaクライアント生成
npm run db:generate

# データベーススキーマ適用
npm run db:push

# データベースGUI起動
npm run db:studio
```

## 🗄️ データベーススキーマ

### Users テーブル

```sql
- id: String (CUID)
- email: String (ユニーク)
- name: String?
- image: String?
- createdAt: DateTime
- updatedAt: DateTime
```

### Subscriptions テーブル

```sql
- id: String (CUID)
- name: String
- description: String?
- price: Int (円単位)
- paymentCycle: Enum (MONTHLY/YEARLY/SEMI_ANNUAL/QUARTERLY)
- paymentDay: Int (1-31)
- startMonth: Int? (1-12)
- category: String?
- url: String?
- isActive: Boolean
- userId: String (外部キー)
- cardId: String? (外部キー)
```

### PaymentCards テーブル

```sql
- id: String (CUID)
- name: String
- lastFour: String
- brand: String
- expiryMonth: Int
- expiryYear: Int
- isDefault: Boolean
- userId: String (外部キー)
```

## 🔧 トラブルシューティング

### データが保存されない場合

1. **データベース接続確認**

   ```bash
   npm run db:studio
   ```

2. **環境変数確認**

   ```bash
   echo $DATABASE_URL
   ```

3. **ネットワークタブで API 呼び出し確認**
   - ブラウザの DevTools で API リクエストをチェック

### 開発環境での確認手順

1. **サーバー起動**

   ```bash
   npm run dev
   ```

2. **データベース GUI 起動**

   ```bash
   npm run db:studio
   ```

3. **テストデータ作成**
   - ログイン → サブスクリプション追加
   - Prisma Studio でデータベース確認

### 本番環境（Vercel）での設定

1. **Vercel 環境変数設定**

   - プロジェクト設定 → Environment Variables
   - すべての環境変数を設定

2. **データベースプロバイダー推奨**
   - Vercel Postgres
   - Railway
   - PlanetScale
   - Supabase

## 🚀 API 仕様

### Subscriptions API

#### GET /api/subscriptions

ユーザーのサブスクリプション一覧取得

#### POST /api/subscriptions

新規サブスクリプション作成

```json
{
  "name": "Netflix",
  "price": 1490,
  "paymentCycle": "MONTHLY",
  "paymentDay": 15,
  "category": "動画配信",
  "url": "https://netflix.com"
}
```

#### PUT /api/subscriptions/[id]

サブスクリプション更新

#### DELETE /api/subscriptions/[id]

サブスクリプション削除（論理削除）

### Payment Cards API

#### GET /api/payment-cards

ユーザーの支払いカード一覧取得

#### POST /api/payment-cards

新規支払いカード作成

```json
{
  "name": "メインカード",
  "lastFour": "1234",
  "brand": "Visa",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "isDefault": true
}
```

## 📈 次のステップ

### 完了済み ✅

- API エンドポイント作成
- フロントエンド API 統合
- エラーハンドリング
- 環境設定自動化

### 実装推奨 📝

1. **バックアップ機能**
2. **データインポート/エクスポート**
3. **通知機能（支払い期限）**
4. **レポート機能**
5. **一括操作機能**

### パフォーマンス最適化 ⚡

1. **API レスポンス キャッシュ**
2. **画像最適化**
3. **コード分割**
4. **Progressive Web App (PWA)**

## 🔐 セキュリティ

- セッション管理: NextAuth.js
- API 認証: サーバーサイドセッション検証
- データベース: Prisma ORM（SQL インジェクション対策）
- 環境変数: 秘匿情報を適切に管理

---

## 📞 サポート

問題が発生した場合：

1. **ログ確認**: ブラウザ Console + サーバーログ
2. **データベース確認**: `npm run db:studio`
3. **API テスト**: Postman 等で API 直接テスト
4. **環境リセット**: `rm -rf node_modules && npm install`
