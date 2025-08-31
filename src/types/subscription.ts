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
