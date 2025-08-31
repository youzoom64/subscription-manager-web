export interface Subscription {
  id: string;
  name: string;
  description?: string;
  price: number; // 円単位
  paymentCycle: PaymentCycle;
  paymentDay: number; // 1-31
  startMonth?: number; // 1-12
  category?: string;
  url?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  cardId?: string;
  paymentCard?: PaymentCard;
  order: number; // 追加: 表示順序
}

export interface PaymentCard {
  id: string;
  name: string;
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  SEMI_ANNUAL = "SEMI_ANNUAL",
  QUARTERLY = "QUARTERLY",
}

export const PAYMENT_CYCLES = {
  MONTHLY: { label: "月払い", months: 1 },
  QUARTERLY: { label: "四半期払い", months: 3 },
  SEMI_ANNUAL: { label: "半年払い", months: 6 },
  YEARLY: { label: "年払い", months: 12 },
};

// カード会社の定義
export const CARD_COMPANIES = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  JCB: "JCB",
  AMEX: "American Express",
  DINERS: "Diners Club",
};

// CardService (存在しないexportエラーを修正)
export class CardService {
  static validateCardNumber(number: string): boolean {
    // 簡易的なカード番号バリデーション
    return /^\d{13,19}$/.test(number.replace(/\s/g, ""));
  }

  static getCardBrand(number: string): string {
    const cleanNumber = number.replace(/\s/g, "");
    if (cleanNumber.startsWith("4")) return "Visa";
    if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2"))
      return "Mastercard";
    if (cleanNumber.startsWith("3")) return "American Express";
    return "Unknown";
  }

  static formatCardNumber(number: string): string {
    return number
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  static getCards(): PaymentCard[] {
    // localStorage から PaymentCard[] を取得する実装
    if (typeof window === "undefined") return [];
    try {
      const cards = localStorage.getItem("paymentCards");
      return cards ? JSON.parse(cards) : [];
    } catch {
      return [];
    }
  }

  // saveCardsメソッドを追加
  static saveCards(cards: PaymentCard[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("paymentCards", JSON.stringify(cards));
    } catch (error) {
      console.error("カード情報の保存に失敗しました:", error);
    }
  }

  // deleteCardメソッドも追加
  static deleteCard(cardId: string): void {
    const cards = this.getCards();
    const updatedCards = cards.filter((card) => card.id !== cardId);
    this.saveCards(updatedCards);
  }
}
