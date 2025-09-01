"use client";

import { useState } from "react";
import {
  Subscription,
  PaymentCard,
  PAYMENT_CYCLES,
  PaymentCycle,
} from "@/types/subscription";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  cards: PaymentCard[];
  onSave: (updatedSubscription: Subscription) => void;
}

export default function EditModal({
  isOpen,
  onClose,
  subscription,
  cards,
  onSave,
}: EditModalProps) {
  const [formData, setFormData] = useState({
    name: subscription.name,
    price: subscription.price,
    paymentDay: subscription.paymentDay,
    paymentCycle: subscription.paymentCycle,
    startMonth: subscription.startMonth || 0,
    cardId: subscription.cardId || "",
    url: subscription.url || "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSubscription: Subscription = {
      ...subscription,
      name: formData.name.trim(),
      price: Number(formData.price),
      paymentDay: Number(formData.paymentDay),
      paymentCycle: formData.paymentCycle,
      startMonth: formData.startMonth || undefined,
      cardId: formData.cardId || undefined,
      url: formData.url.trim() || undefined,
      updatedAt: new Date(),
    };

    onSave(updatedSubscription);
    onClose();
  };

  const showStartMonth = formData.paymentCycle !== PaymentCycle.MONTHLY;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">
            サブスクリプション編集
          </h2>
          <button
            onClick={onClose}
            className="text-black hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* サービス名 */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              サービス名
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          {/* 料金 */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              料金（円）
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: Number(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              min="0"
              required
            />
          </div>

          {/* 支払日 */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              支払日
            </label>
            <input
              type="number"
              value={formData.paymentDay}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentDay: Number(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              min="1"
              max="31"
              required
            />
          </div>

          {/* 支払いサイクル */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {Object.entries(PAYMENT_CYCLES).map(([key, cycle]) => (
                <option key={key} value={key}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>

          {/* 開始月（月払い以外の場合のみ表示） */}
          {showStartMonth && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                開始月
              </label>
              <select
                value={formData.startMonth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startMonth: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value={0}>選択してください</option>
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-black">
                支払いカード
              </label>
              <button
                type="button"
                onClick={() => alert("カード管理はメイン画面の「カード管理」ボタンから行えます")}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                + カード追加
              </button>
            </div>
            <select
              value={formData.cardId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cardId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">カードを選択してください</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.brand} ****{card.lastFour} ({card.name})
                </option>
              ))}
            </select>
          </div>

          {/* 管理URL */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              管理URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="https://example.com/account"
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
