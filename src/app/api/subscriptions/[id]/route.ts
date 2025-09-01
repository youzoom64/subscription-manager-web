import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { SubscriptionService } from "@/lib/subscriptionService";
import { authOptions } from "../../auth/[...nextauth]/route";

// サブスクリプション更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const subscriptionId = params.id;

    const updatedSubscription = await SubscriptionService.updateSubscription(
      subscriptionId,
      body
    );

    if (!updatedSubscription) {
      return NextResponse.json(
        { error: "サブスクリプションの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error("サブスクリプション更新エラー:", error);
    return NextResponse.json(
      { error: "サブスクリプションの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// サブスクリプション削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const subscriptionId = params.id;
    const success = await SubscriptionService.deleteSubscription(
      subscriptionId
    );

    if (!success) {
      return NextResponse.json(
        { error: "サブスクリプションの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "削除が完了しました" });
  } catch (error) {
    console.error("サブスクリプション削除エラー:", error);
    return NextResponse.json(
      { error: "サブスクリプションの削除に失敗しました" },
      { status: 500 }
    );
  }
}
