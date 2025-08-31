import { Subscription } from '@/types/subscription';

export const DEFAULT_SUBSCRIPTIONS: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'YouTube Premium',
    price: 1280,
    payment_day: 1,
    active: true,
    card_id: null,
    order: 1,
    management_url: 'https://www.youtube.com/premium',
    payment_cycle: 'monthly',
    start_month: null
  },
  {
    name: 'Claude Pro',
    price: 2900,
    payment_day: 5,
    active: true,
    card_id: null,
    order: 2,
    management_url: 'https://claude.ai/upgrade',
    payment_cycle: 'monthly',
    start_month: null
  },
  {
    name: 'Amazon Prime',
    price: 5900,
    payment_day: 10,
    active: true,
    card_id: null,
    order: 3,
    management_url: 'https://www.amazon.co.jp/gp/primecentral',
    payment_cycle: 'annual',
    start_month: 4
  },
  {
    name: 'Netflix',
    price: 890,
    payment_day: 15,
    active: true,
    card_id: null,
    order: 4,
    management_url: 'https://www.netflix.com/youraccount',
    payment_cycle: 'monthly',
    start_month: null
  },
  {
    name: 'SUNO AI Pro',
    price: 1500,
    payment_day: 20,
    active: true,
    card_id: null,
    order: 5,
    management_url: 'https://app.suno.ai/account',
    payment_cycle: 'monthly',
    start_month: null
  }
];
