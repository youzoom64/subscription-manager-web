"use client";

import { useState, useEffect } from "react";
import {
  Subscription,
  PaymentCard,
  PAYMENT_CYCLES,
  CardService,
  PaymentCycle,
} from "@/types/subscription";
import { SubscriptionService } from "@/lib/subscriptionService";
import { ApiClient } from "@/lib/apiClient";
import EditModal from "./EditModal";
import AddSubscriptionForm from "./AddSubscriptionForm";
import CardManagement from "./CardManagement";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onUpdate: () => void;
}

export default function SubscriptionList({
  subscriptions,
  onUpdate,
}: SubscriptionListProps) {
  // 未使用変数を削除
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCardManagementOpen, setIsCardManagementOpen] = useState(false);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const cardData = await ApiClient.getPaymentCards();
        setCards(cardData);
      } catch (error) {
        console.error("カード取得エラー:", error);
        // フォールバックとしてローカルストレージから取得
        const localCards = CardService.getCards();
        setCards(localCards);
      }
    };
    loadCards();
  }, []);

  // 編集モーダルを開く
  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  // 編集保存
  const handleSaveEdit = async (updatedSubscription: Subscription) => {
    try {
      const result = await ApiClient.updateSubscription(
        updatedSubscription.id,
        updatedSubscription
      );
      if (result) {
        onUpdate(); // 親コンポーネントで再取得
      }
    } catch (error) {
      console.error("更新エラー:", error);
      alert("更新に失敗しました");
    }
  };

  // 新規追加処理
  const handleAddSubscription = async (
    newSubscriptionData: Omit<
      Subscription,
      "id" | "createdAt" | "updatedAt" | "userId"
    >
  ) => {
    try {
      const result = await ApiClient.createSubscription(newSubscriptionData);
      if (result) {
        onUpdate(); // 親コンポーネントで再取得
      }
    } catch (error) {
      console.error("作成エラー:", error);
      alert("作成に失敗しました");
    }
  };

  // 削除処理
  const handleDeleteSubscription = async (
    subscriptionToDelete: Subscription
  ) => {
    const confirmDelete = window.confirm(
      `${subscriptionToDelete.name}を削除しますか？この操作は取り消せません。`
    );

    if (confirmDelete) {
      try {
        const success = await ApiClient.deleteSubscription(
          subscriptionToDelete.id
        );
        if (success) {
          onUpdate(); // 親コンポーネントで再取得
        }
      } catch (error) {
        console.error("削除エラー:", error);
        alert("削除に失敗しました");
      }
    }
  };

  const reloadCards = async () => {
    try {
      const cardData = await ApiClient.getPaymentCards();
      setCards(cardData);
    } catch (error) {
      console.error("カード再取得エラー:", error);
      // フォールバックとしてローカルストレージから取得
      const localCards = CardService.getCards();
      setCards(localCards);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const subscription = subscriptions.find((sub) => sub.id === id);
      if (!subscription) return;

      const updated = { ...subscription, isActive: !subscription.isActive };
      const result = await ApiClient.updateSubscription(id, updated);
      if (result) {
        onUpdate(); // 親コンポーネントで再取得
      }
    } catch (error) {
      console.error("アクティブ状態の更新エラー:", error);
      alert("状態の更新に失敗しました");
    }
  };

  const formatPrice = (subscription: Subscription) => {
    const monthlyEquivalent =
      SubscriptionService.getMonthlyEquivalent(subscription);

    if (subscription.paymentCycle === PaymentCycle.MONTHLY) {
      return `¥${subscription.price.toLocaleString()}`;
    } else {
      return `¥${monthlyEquivalent.toLocaleString()}/¥${subscription.price.toLocaleString()}`;
    }
  };

  const formatNextPayment = (subscription: Subscription) => {
    if (!subscription.isActive) return "-";

    const nextDate = SubscriptionService.getNextPaymentDate(subscription);
    return nextDate.toLocaleDateString("ja-JP");
  };

  // カード表示名を取得
  const getCardDisplayName = (cardId: string | null | undefined) => {
    if (!cardId) return "-";
    const card = cards.find((c) => c.id === cardId);
    if (!card) return "-";
    return `${card.brand} ****${card.lastFour}`;
  };

  const handleUrlClick = (url: string | undefined) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const getTotalMonthlyAmount = () => {
    return subscriptions
      .filter((sub) => sub.isActive)
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
          <h2 className="text-xl font-semibold text-black">
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
              <div className="text-sm text-black">月相当額合計</div>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                サービス名
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                月相当額/実支払額
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                サイクル
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                支払日
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                次回支払日
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                支払いカード
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                管理URL
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                操作
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-black">
                状態
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSubscriptions.map((subscription) => (
              <tr
                key={subscription.id}
                className={`hover:bg-gray-50 ${
                  subscription.isActive ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-black">
                  {subscription.name}
                </td>
                <td className="px-4 py-3 text-sm text-black">
                  {formatPrice(subscription)}
                </td>
                <td className="px-4 py-3 text-sm text-black">
                  {PAYMENT_CYCLES[subscription.paymentCycle].label}
                </td>
                <td className="px-4 py-3 text-sm text-black">
                  {subscription.paymentDay}日
                </td>
                <td className="px-4 py-3 text-sm text-black">
                  {formatNextPayment(subscription)}
                </td>
                <td className="px-4 py-3 text-sm text-black">
                  {getCardDisplayName(subscription.cardId)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {subscription.url ? (
                    <button
                      onClick={() => handleUrlClick(subscription.url)}
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
                      subscription.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {subscription.isActive ? "ON" : "OFF"}
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
