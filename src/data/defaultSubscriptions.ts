import { Subscription, PaymentCycle } from "@/types/subscription";

export const DEFAULT_SUBSCRIPTIONS: Omit<
  Subscription,
  "id" | "createdAt" | "updatedAt" | "userId"
>[] = [];
