import { Subscription, PaymentCard } from "@/types/subscription";

export class ApiClient {
  // サブスクリプション関連のAPIクライアント

  static async getSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("サブスクリプション取得エラー:", error);
      return [];
    }
  }

  static async createSubscription(
    subscriptionData: Omit<
      Subscription,
      "id" | "userId" | "createdAt" | "updatedAt"
    >
  ): Promise<Subscription | null> {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("サブスクリプション作成エラー:", error);
      return null;
    }
  }

  static async updateSubscription(
    subscriptionId: string,
    updates: Partial<Omit<Subscription, "id" | "userId" | "createdAt">>
  ): Promise<Subscription | null> {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("サブスクリプション更新エラー:", error);
      return null;
    }
  }

  static async deleteSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("サブスクリプション削除エラー:", error);
      return false;
    }
  }

  // 支払いカード関連のAPIクライアント

  static async getPaymentCards(): Promise<PaymentCard[]> {
    try {
      const response = await fetch("/api/payment-cards");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("支払いカード取得エラー:", error);
      return [];
    }
  }

  static async createPaymentCard(
    cardData: Omit<PaymentCard, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<PaymentCard | null> {
    try {
      const response = await fetch("/api/payment-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("支払いカード作成エラー:", error);
      return null;
    }
  }
}
