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
          isActive: true,
        },
        include: {
          paymentCard: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Prismaの結果をフロントエンド型に変換
      return subscriptions.map((sub: any) => ({
        ...sub,
        paymentCycle: sub.paymentCycle as PaymentCycle,
      }));
    } catch (error) {
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
          ...subscriptionData,
          userId: user.id,
          paymentCycle: subscriptionData.paymentCycle as any, // Enumとして扱う
        },
        include: {
          paymentCard: true,
        },
      });

      return {
        ...subscription,
        paymentCycle: subscription.paymentCycle as PaymentCycle,
      };
    } catch (error) {
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
          ...updates,
          paymentCycle: updates.paymentCycle as any,
          updatedAt: new Date(),
        },
        include: {
          paymentCard: true,
        },
      });

      return {
        ...subscription,
        paymentCycle: subscription.paymentCycle as PaymentCycle,
      };
    } catch (error) {
      console.error("サブスクリプション更新エラー:", error);
      return null;
    }
  }

  // サブスクリプション削除（論理削除）
  static async deleteSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
      let nextPayment = new Date(
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
    let nextPayment = new Date(currentYear, startMonth - 1, paymentDay);

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
