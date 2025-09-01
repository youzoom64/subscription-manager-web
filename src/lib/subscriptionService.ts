import {
  Subscription,
  PaymentCard,
  PAYMENT_CYCLES,
  PaymentCycle,
} from "@/types/subscription";
import { prisma } from "@/lib/prisma";

export class SubscriptionService {
  // ユーザー作成または取得
  static async findOrCreateUser(email: string, name?: string, image?: string) {
    return await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        image: image || undefined,
        updatedAt: new Date(),
      },
      create: {
        email,
        name: name || null,
        image: image || null,
      },
    });
  }

  // サブスクリプション一覧取得
  static async getSubscriptions(userEmail: string): Promise<Subscription[]> {
    try {
      const user = await this.findOrCreateUser(userEmail);

      const subscriptions = await prisma.subscription.findMany({
        where: {
          userId: user.id,
        },
        include: {
          paymentCard: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Prismaの結果をフロントエンド型に変換 - 型を明示的に指定
      return subscriptions.map(
        (sub: (typeof subscriptions)[0]): Subscription => ({
          id: sub.id,
          name: sub.name,
          description: sub.description || undefined,
          price: sub.price,
          paymentCycle: sub.paymentCycle as PaymentCycle,
          paymentDay: sub.paymentDay,
          startMonth: sub.startMonth || undefined,
          category: sub.category || undefined,
          url: sub.url || undefined,
          isActive: sub.isActive,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
          userId: sub.userId,
          cardId: sub.cardId || undefined,
          paymentCard: sub.paymentCard || undefined,
          order: 0, // デフォルト値を設定（必要に応じて調整）
        })
      );
    } catch (error: unknown) {
      console.error("サブスクリプション取得エラー:", error);
      return [];
    }
  }

  // サブスクリプション作成
  static async createSubscription(
    userEmail: string,
    subscriptionData: Omit<
      Subscription,
      "id" | "userId" | "createdAt" | "updatedAt"
    >
  ): Promise<Subscription | null> {
    try {
      const user = await this.findOrCreateUser(userEmail);

      const subscription = await prisma.subscription.create({
        data: {
          name: subscriptionData.name,
          description: subscriptionData.description || null,
          price: subscriptionData.price,
          paymentCycle: subscriptionData.paymentCycle,
          paymentDay: subscriptionData.paymentDay,
          startMonth: subscriptionData.startMonth || null,
          category: subscriptionData.category || null,
          url: subscriptionData.url || null,
          isActive: subscriptionData.isActive,
          cardId: subscriptionData.cardId || null,
          userId: user.id,
        },
        include: {
          paymentCard: true,
        },
      });

      return {
        id: subscription.id,
        name: subscription.name,
        description: subscription.description || undefined,
        price: subscription.price,
        paymentCycle: subscription.paymentCycle as PaymentCycle,
        paymentDay: subscription.paymentDay,
        startMonth: subscription.startMonth || undefined,
        category: subscription.category || undefined,
        url: subscription.url || undefined,
        isActive: subscription.isActive,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        userId: subscription.userId,
        cardId: subscription.cardId || undefined,
        paymentCard: subscription.paymentCard || undefined,
        order: subscriptionData.order,
      };
    } catch (error: unknown) {
      console.error("サブスクリプション作成エラー:", error);
      return null;
    }
  }

  // サブスクリプション更新
  static async updateSubscription(
    subscriptionId: string,
    updates: Partial<Omit<Subscription, "id" | "userId" | "createdAt">>
  ): Promise<Subscription | null> {
    try {
      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          name: updates.name,
          description: updates.description || null,
          price: updates.price,
          paymentCycle: updates.paymentCycle,
          paymentDay: updates.paymentDay,
          startMonth: updates.startMonth || null,
          category: updates.category || null,
          url: updates.url || null,
          isActive: updates.isActive,
          cardId: updates.cardId || null,
          updatedAt: new Date(),
        },
        include: {
          paymentCard: true,
        },
      });

      return {
        id: subscription.id,
        name: subscription.name,
        description: subscription.description || undefined,
        price: subscription.price,
        paymentCycle: subscription.paymentCycle as PaymentCycle,
        paymentDay: subscription.paymentDay,
        startMonth: subscription.startMonth || undefined,
        category: subscription.category || undefined,
        url: subscription.url || undefined,
        isActive: subscription.isActive,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        userId: subscription.userId,
        cardId: subscription.cardId || undefined,
        paymentCard: subscription.paymentCard || undefined,
        order: updates.order || 0,
      };
    } catch (error: unknown) {
      console.error("サブスクリプション更新エラー:", error);
      return null;
    }
  }

  // サブスクリプション削除（物理削除）
  static async deleteSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await prisma.subscription.delete({
        where: { id: subscriptionId },
      });
      return true;
    } catch (error: unknown) {
      console.error("サブスクリプション削除エラー:", error);
      return false;
    }
  }

  // 支払いカード一覧取得
  static async getPaymentCards(userEmail: string): Promise<PaymentCard[]> {
    try {
      const user = await this.findOrCreateUser(userEmail);

      return await prisma.paymentCard.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });
    } catch (error: unknown) {
      console.error("支払いカード取得エラー:", error);
      return [];
    }
  }

  // 支払いカード作成
  static async createPaymentCard(
    userEmail: string,
    cardData: Omit<PaymentCard, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<PaymentCard | null> {
    try {
      const user = await this.findOrCreateUser(userEmail);

      return await prisma.paymentCard.create({
        data: {
          ...cardData,
          userId: user.id,
        },
      });
    } catch (error: unknown) {
      console.error("支払いカード作成エラー:", error);
      return null;
    }
  }

  // 次回支払日計算
  static getNextPaymentDate(subscription: Subscription): Date {
    const today = new Date();
    const { paymentDay, paymentCycle, startMonth } = subscription;
    const cycleMonths = PAYMENT_CYCLES[paymentCycle].months;

    if (paymentCycle === PaymentCycle.MONTHLY || !startMonth) {
      const nextPayment = new Date(
        today.getFullYear(),
        today.getMonth(),
        paymentDay
      );
      if (nextPayment <= today) {
        nextPayment.setMonth(nextPayment.getMonth() + cycleMonths);
      }
      return nextPayment;
    } else {
      return this.calculateNextPaymentWithStartMonth(
        today,
        paymentDay,
        cycleMonths,
        startMonth
      );
    }
  }

  private static calculateNextPaymentWithStartMonth(
    today: Date,
    paymentDay: number,
    cycleMonths: number,
    startMonth: number
  ): Date {
    const currentYear = today.getFullYear();
    const nextPayment = new Date(currentYear, startMonth - 1, paymentDay);

    while (nextPayment <= today) {
      nextPayment.setMonth(nextPayment.getMonth() + cycleMonths);
    }

    return nextPayment;
  }

  // 月相当額計算
  static getMonthlyEquivalent(subscription: Subscription): number {
    const cycleMonths = PAYMENT_CYCLES[subscription.paymentCycle].months;
    return subscription.price / cycleMonths;
  }
}

// デフォルトエクスポートも追加（互換性のため）
export default SubscriptionService;
