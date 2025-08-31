"use client";

import { useState, useEffect } from "react";
import {
  Subscription,
  PaymentCard,
  PAYMENT_CYCLES,
  CardService,
} from "@/types/subscription";
import { SubscriptionService } from "@/lib/subscriptionService";
import EditModal from "./EditModal";
import AddSubscriptionForm from "./AddSubscriptionForm";
import CardManagement from "./CardManagement";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onUpdate: (subscriptions: Subscription[]) => void;
}

export default function SubscriptionList({
  subscriptions,
  onUpdate,
}: SubscriptionListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCardManagementOpen, setIsCardManagementOpen] = useState(false);

  useEffect(() => {
    const loadCards = () => {
      const cardData = CardService.getCards();
      setCards(cardData);
    };
    loadCards();
  }, []);

  // 編集モーダルを開く
  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  // 編集保存
  const handleSaveEdit = (updatedSubscription: Subscription) => {
    const updated = subscriptions.map((sub) =>
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    );
    onUpdate(updated);
  };

  // 新規追加処理
  const handleAddSubscription = (
    newSubscriptionData: Omit<Subscription, "id" | "created_at" | "updated_at">
  ) => {
    const maxOrder = Math.max(...subscriptions.map((s) => s.order), 0);

    const newSubscription: Subscription = {
      ...newSubscriptionData,
      id: `sub_${Date.now()}`,
      order: maxOrder + 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updated = [...subscriptions, newSubscription];
    onUpdate(updated);
  };

  // 削除処理
  const handleDeleteSubscription = (subscriptionToDelete: Subscription) => {
    const confirmDelete = window.confirm(
      `${subscriptionToDelete.name}を削除しますか？この操作は取り消せません。`
    );

    if (confirmDelete) {
      const updated = subscriptions.filter(
        (sub) => sub.id !== subscriptionToDelete.id
      );
      onUpdate(updated);
    }
  };

  const reloadCards = () => {
    const cardData = CardService.getCards();
    setCards(cardData);
  };

  const toggleActive = (id: string) => {
    const updated = subscriptions.map((sub) =>
      sub.id === id
        ? { ...sub, active: !sub.active, updated_at: new Date() }
        : sub
    );
    onUpdate(updated);
  };

  const formatPrice = (subscription: Subscription) => {
    const monthlyEquivalent =
      SubscriptionService.getMonthlyEquivalent(subscription);

    if (subscription.payment_cycle === "monthly") {
      return `¥${subscription.price.toLocaleString()}`;
    } else {
      return `¥${monthlyEquivalent.toLocaleString()}/¥${subscription.price.toLocaleString()}`;
    }
  };

  const formatNextPayment = (subscription: Subscription) => {
    if (!subscription.active) return "-";

    const nextDate = SubscriptionService.getNextPaymentDate(subscription);
    return nextDate.toLocaleDateString("ja-JP");
  };

  // カード表示名を取得
  const getCardDisplayName = (cardId: string | null) => {
    if (!cardId) return "-";
    const card = cards.find((c) => c.id === cardId);
    if (!card) return "-";
    return `${card.company} ****${card.last_four}`;
  };

  const handleUrlClick = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const getTotalMonthlyAmount = () => {
    return subscriptions
      .filter((sub) => sub.active)
      .reduce(
        (total, sub) => total + SubscriptionService.getMonthlyEquivalent(sub),
        0
      );
  };

  const sortedSubscriptions = [...subscriptions].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            サブスクリプション一覧
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-3">
              <button
                onClick={() => setIsCardManagementOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              >
                カード管理
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
              >
                + 新規追加
              </button>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">月相当額合計</div>
              <div className="text-lg font-bold text-blue-600">
                ¥{getTotalMonthlyAmount().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                サービス名
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                月相当額/実支払額
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                サイクル
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                支払日
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                次回支払日
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                支払いカード
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                管理URL
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                操作
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                状態
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSubscriptions.map((subscription) => (
              <tr
                key={subscription.id}
                className={`hover:bg-gray-50 ${
                  subscription.active ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {subscription.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatPrice(subscription)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {PAYMENT_CYCLES[subscription.payment_cycle].name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {subscription.payment_day}日
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatNextPayment(subscription)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {getCardDisplayName(subscription.card_id)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {subscription.management_url ? (
                    <button
                      onClick={() =>
                        handleUrlClick(subscription.management_url)
                      }
                      className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      管理ページ
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => openEditModal(subscription)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 mr-2"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteSubscription(subscription)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200"
                  >
                    削除
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => toggleActive(subscription.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscription.active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {subscription.active ? "ON" : "OFF"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* カード管理モーダル */}
        <CardManagement
          isOpen={isCardManagementOpen}
          onClose={() => {
            setIsCardManagementOpen(false);
            reloadCards(); // カード管理画面を閉じた時にカード情報を再読込
          }}
        />

        {/* 新規追加モーダル */}
        <AddSubscriptionForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          cards={cards}
          onAdd={handleAddSubscription}
        />

        {/* 編集モーダル */}
        {editingSubscription && (
          <EditModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingSubscription(null);
            }}
            subscription={editingSubscription}
            cards={cards}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </div>
  );
}
