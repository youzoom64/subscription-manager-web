#!/usr/bin/env node

/**
 * データベースセットアップスクリプト
 *
 * 使用方法:
 * 1. .env.localファイルを作成し、データベース接続情報を設定
 * 2. npm run db:setup または node scripts/setup-database.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔄 データベースセットアップを開始します...");

// 1. 環境変数ファイルの確認
const envFilePath = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envFilePath)) {
  console.error("❌ .env.localファイルが見つかりません。");
  console.log("📝 以下の内容で.env.localファイルを作成してください:");
  console.log(`
# NextAuth.js設定
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth設定  
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# データベース設定
DATABASE_URL="postgresql://username:password@localhost:5432/subscription_manager"
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/subscription_manager"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/subscription_manager"
  `);
  process.exit(1);
}

try {
  // 2. Prismaクライアント生成
  console.log("📦 Prismaクライアントを生成中...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // 3. データベーススキーマをプッシュ
  console.log("🗄️ データベーススキーマを適用中...");
  execSync("npx prisma db push", { stdio: "inherit" });

  // 4. データベース接続テスト
  console.log("🔍 データベース接続をテスト中...");
  execSync("npx prisma studio --browser none &", { stdio: "pipe" });

  console.log("✅ データベースセットアップが完了しました！");
  console.log("");
  console.log("🎉 次のステップ:");
  console.log("1. npm run dev でアプリケーションを起動");
  console.log("2. npx prisma studio でデータベースGUIを確認");
  console.log("3. ブラウザでアプリケーションにアクセスしてテスト");
} catch (error) {
  console.error("❌ セットアップ中にエラーが発生しました:", error.message);
  console.log("");
  console.log("🔧 トラブルシューティング:");
  console.log("1. データベースサーバーが起動していることを確認");
  console.log("2. .env.localの接続情報が正しいことを確認");
  console.log("3. PostgreSQLサーバーにアクセス権限があることを確認");
  process.exit(1);
}
