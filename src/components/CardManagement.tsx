"use client";

import { useState, useEffect } from "react";
import { PaymentCard, CARD_COMPANIES, CardService } from "@/types/subscription";

interface CardManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardManagement({
  isOpen,
  onClose,
}: CardManagementProps) {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "VISA",
    lastFour: "",
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
  });

  useEffect(() => {
    if (isOpen) {
      loadCards();
    }
  }, [isOpen]);

  const loadCards = () => {
    const cardData = CardService.getCards();
    setCards(cardData);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.lastFour.trim()) {
      alert("カード名と末尾4桁を入力してください");
      return;
    }

    if (formData.lastFour.length !== 4 || !/^\d+$/.test(formData.lastFour)) {
      alert("末尾4桁は4桁の数字で入力してください");
      return;
    }

    const newCard: PaymentCard = {
      id: `card_${Date.now()}`,
      name: formData.name.trim(),
      brand: formData.brand,
      lastFour: formData.lastFour,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      isDefault: cards.length === 0, // 最初のカードをデフォルトに
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "temp-user", // 適切なユーザーIDを設定
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);

    // CardServiceに保存 - エラーハンドリング付き
    try {
      CardService.saveCards(updatedCards);
    } catch (error) {
      console.error("カード保存エラー:", error);
    }

    // フォームリセット
    setFormData({
      name: "",
      brand: "VISA",
      lastFour: "",
      expiryMonth: 1,
      expiryYear: new Date().getFullYear(),
    });
    setIsAddFormOpen(false);
  };

  const handleDeleteCard = (cardToDelete: PaymentCard) => {
    const confirmDelete = window.confirm(
      `${cardToDelete.name}を削除しますか？\n\n注意: このカードを使用しているサブスクリプションのカード設定もクリアされます。`
    );

    if (confirmDelete) {
      const updatedCards = cards.filter(
        (card: PaymentCard) => card.id !== cardToDelete.id
      );
      setCards(updatedCards);

      // CardServiceに保存 - エラーハンドリング付き
      try {
        CardService.saveCards(updatedCards);
        alert("カードを削除しました");
      } catch (error) {
        console.error("カード削除エラー:", error);
        alert("カードの削除に失敗しました");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-black">カード管理</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-black text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 追加ボタン */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddFormOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
          >
            + 新しいカードを追加
          </button>
        </div>

        {/* 追加フォーム */}
        {isAddFormOpen && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4 text-black">新しいカードを追加</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    カード名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="例: メインカード"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    カードブランド *
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    {Object.entries(CARD_COMPANIES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    末尾4桁 *
                  </label>
                  <input
                    type="text"
                    value={formData.lastFour}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastFour: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1234"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      有効期限月
                    </label>
                    <select
                      value={formData.expiryMonth}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expiryMonth: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}月
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      有効期限年
                    </label>
                    <select
                      value={formData.expiryYear}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expiryYear: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}年
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>

            <p className="text-xs text-black mt-2">
              ※ セキュリティのため、末尾4桁のみ保存されます
            </p>
          </div>
        )}

        {/* カード一覧 */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-black">登録カード一覧</h3>
          {cards.length === 0 ? (
            <p className="text-black text-center py-8">
              登録されたカードがありません
            </p>
          ) : (
            <div className="space-y-3">
              {cards.map((card: PaymentCard) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CARD</span>
                    </div>
                    <div>
                      <div className="font-medium text-black">{card.name}</div>
                      <div className="text-sm text-black">
                        {card.brand} •••• •••• •••• {card.lastFour}
                      </div>
                      <div className="text-xs text-black">
                        有効期限: {card.expiryMonth}/{card.expiryYear}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {card.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        デフォルト
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteCard(card)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 閉じるボタン */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
