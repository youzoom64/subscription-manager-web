import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { SubscriptionService } from "@/lib/subscriptionService";
import { authOptions } from "../auth/[...nextauth]/route";

// サブスクリプション一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const subscriptions = await SubscriptionService.getSubscriptions(
      session.user.email
    );

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("サブスクリプション取得エラー:", error);
    return NextResponse.json(
      { error: "サブスクリプションの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// サブスクリプション作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();

    // 必須フィールドの検証
    if (!body.name || !body.price || !body.paymentCycle || !body.paymentDay) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      );
    }

    const subscription = await SubscriptionService.createSubscription(
      session.user.email,
      body
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "サブスクリプションの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("サブスクリプション作成エラー:", error);
    return NextResponse.json(
      { error: "サブスクリプションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
