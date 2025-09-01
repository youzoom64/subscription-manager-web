"use client";

import { useState } from "react";
import {
  Subscription,
  PaymentCard,
  PAYMENT_CYCLES,
  PaymentCycle,
} from "@/types/subscription";
import { POPULAR_SERVICES, SERVICE_CATEGORIES } from "@/data/popularServices";

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
  const [selectedService, setSelectedService] = useState("");
  const [customMode, setCustomMode] = useState(false);
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

  const handleServiceSelect = (serviceName: string) => {
    if (serviceName === "custom") {
      setCustomMode(true);
      setSelectedService("");
      setFormData({
        name: "",
        price: 0,
        paymentDay: 1,
        paymentCycle: PaymentCycle.MONTHLY,
        startMonth: "",
        cardId: "",
        url: "",
      });
    } else if (serviceName) {
      setCustomMode(false);
      setSelectedService(serviceName);
      const service =
        POPULAR_SERVICES[serviceName as keyof typeof POPULAR_SERVICES];
      // 自動入力するが、ユーザーが編集可能
      setFormData({
        name: serviceName,
        price: service.price,
        paymentDay: 1,
        paymentCycle: service.cycle as PaymentCycle,
        startMonth: "",
        cardId: "",
        url: service.url,
      });
    } else {
      setCustomMode(false);
      setSelectedService("");
      setFormData({
        name: "",
        price: 0,
        paymentDay: 1,
        paymentCycle: PaymentCycle.MONTHLY,
        startMonth: "",
        cardId: "",
        url: "",
      });
    }
  };

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
    setSelectedService("");
    setCustomMode(false);
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

  // サービスをカテゴリ別にグループ化
  const groupedServices = Object.entries(POPULAR_SERVICES).reduce(
    (acc, [name, service]) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(name);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">
            新規サブスクリプション追加
          </h2>
          <button
            onClick={onClose}
            className="text-black hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* サービス選択 */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              サービス選択
            </label>
            <select
              value={customMode ? "custom" : selectedService}
              onChange={(e) => handleServiceSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">サービスを選択してください</option>
              {Object.entries(groupedServices).map(([category, services]) => (
                <optgroup
                  key={category}
                  label={`${
                    SERVICE_CATEGORIES[
                      category as keyof typeof SERVICE_CATEGORIES
                    ]
                  } ${category}`}
                >
                  {services.map((serviceName) => (
                    <option key={serviceName} value={serviceName}>
                      {serviceName} - ¥
                      {POPULAR_SERVICES[
                        serviceName as keyof typeof POPULAR_SERVICES
                      ].price.toLocaleString()}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="custom">📝 カスタムサービスを入力</option>
            </select>
            {selectedService && (
              <p className="text-xs text-green-600 mt-1">
                ✓ 料金とサイクルが自動入力されました
              </p>
            )}
          </div>

          {/* サービス名 */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              サービス名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="例: Spotify Premium"
              required
            />
          </div>

          {/* 料金 */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              min="0"
              placeholder="980"
              required
            />
          </div>

          {/* 支払日 */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
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

          {/* 更新月 */}
          {showStartMonth && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            <label className="block text-sm font-medium text-black mb-1">
              支払いカード
            </label>
            <select
              value={formData.cardId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cardId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
              placeholder="https://..."
            />
            {selectedService && formData.url && (
              <p className="text-xs text-blue-600 mt-1">
                🔗 公式サイトのURLが自動入力されました（編集可能）
              </p>
            )}
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
              className="flex-1 bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
          </div>
        </form>

        {selectedService && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>{selectedService}</strong> の情報が自動入力されました。
              必要に応じて金額・支払日・URL等を自由に編集してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
