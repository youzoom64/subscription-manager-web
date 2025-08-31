"use client";

import { useState } from "react";
import {
  Subscription,
  PaymentCard,
  PAYMENT_CYCLES,
  PaymentCycle,
} from "@/types/subscription";

interface AddSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  cards: PaymentCard[];
  onAdd: (
    subscription: Omit<
      Subscription,
      "id" | "createdAt" | "updatedAt" | "userId"
    >
  ) => void;
}

export default function AddSubscriptionForm({
  isOpen,
  onClose,
  cards,
  onAdd,
}: AddSubscriptionFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    paymentDay: 1,
    paymentCycle: PaymentCycle.MONTHLY,
    startMonth: "",
    cardId: "",
    url: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("サービス名を入力してください");
      return;
    }

    const newSubscription = {
      name: formData.name.trim(),
      price: formData.price,
      paymentDay: formData.paymentDay,
      paymentCycle: formData.paymentCycle,
      startMonth: formData.startMonth
        ? parseInt(formData.startMonth)
        : undefined,
      cardId: formData.cardId || undefined,
      url: formData.url.trim() || undefined,
      isActive: true,
      order: 999, // 新規は最後に追加
    };

    onAdd(newSubscription);

    // フォームリセット
    setFormData({
      name: "",
      price: 0,
      paymentDay: 1,
      paymentCycle: PaymentCycle.MONTHLY,
      startMonth: "",
      cardId: "",
      url: "",
    });

    onClose();
  };

  const showStartMonth = formData.paymentCycle !== PaymentCycle.MONTHLY;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">新規サブスクリプション追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* サービス名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              サービス名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: Spotify Premium"
              required
            />
          </div>

          {/* 料金 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              料金（円） *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              placeholder="980"
              required
            />
          </div>

          {/* 支払日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              支払日 *
            </label>
            <input
              type="number"
              value={formData.paymentDay}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentDay: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="31"
              required
            />
          </div>

          {/* 支払いサイクル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              支払いサイクル
            </label>
            <select
              value={formData.paymentCycle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentCycle: e.target.value as PaymentCycle,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(PAYMENT_CYCLES).map(([key, cycle]) => (
                <option key={key} value={key}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>

          {/* 更新月 */}
          {showStartMonth && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                更新月
              </label>
              <select
                value={formData.startMonth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startMonth: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}月
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 支払いカード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              支払いカード
            </label>
            <select
              value={formData.cardId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cardId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">カードを選択</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.brand} ****{card.lastFour})
                </option>
              ))}
            </select>
          </div>

          {/* 管理URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              管理URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              追加
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
