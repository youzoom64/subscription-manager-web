import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { SubscriptionService } from "@/lib/subscriptionService";
import { authOptions } from "@/lib/auth";

// 支払いカード一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const paymentCards = await SubscriptionService.getPaymentCards(
      session.user.email
    );

    return NextResponse.json(paymentCards);
  } catch (error) {
    console.error("支払いカード取得エラー:", error);
    return NextResponse.json(
      { error: "支払いカードの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 支払いカード作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();

    // 必須フィールドの検証
    if (
      !body.name ||
      !body.lastFour ||
      !body.brand ||
      !body.expiryMonth ||
      !body.expiryYear
    ) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      );
    }

    const paymentCard = await SubscriptionService.createPaymentCard(
      session.user.email,
      body
    );

    if (!paymentCard) {
      return NextResponse.json(
        { error: "支払いカードの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(paymentCard, { status: 201 });
  } catch (error) {
    console.error("支払いカード作成エラー:", error);
    return NextResponse.json(
      { error: "支払いカードの作成に失敗しました" },
      { status: 500 }
    );
  }
}
