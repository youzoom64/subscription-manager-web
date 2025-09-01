import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST() {
  try {
    const prisma = new PrismaClient();
    
    // データベース接続テスト
    await prisma.$connect();
    
    // テーブル作成確認
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ` as Array<{table_name: string}>;
    
    // スキーマ強制同期
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "image" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" INTEGER NOT NULL,
        "paymentCycle" TEXT NOT NULL,
        "paymentDay" INTEGER NOT NULL,
        "startMonth" INTEGER,
        "category" TEXT,
        "url" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        "cardId" TEXT,
        CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "payment_cards" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "lastFour" TEXT NOT NULL,
        "brand" TEXT NOT NULL,
        "expiryMonth" INTEGER NOT NULL,
        "expiryYear" INTEGER NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        CONSTRAINT "payment_cards_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true, 
      message: "Database schema created successfully",
      tables: tables.map(t => t.table_name)
    });

  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Database setup failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
