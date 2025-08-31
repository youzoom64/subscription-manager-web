'use client';

import { useState, useEffect } from 'react';
import { PaymentCard, CARD_COMPANIES, CardService } from '@/types/subscription';

interface CardManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardManagement({ isOpen, onClose }: CardManagementProps) {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: 'VISA',
    last_four: ''
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
    
    if (!formData.name.trim() || !formData.last_four.trim()) {
      alert('カード名と末尾4桁を入力してください');
      return;
    }

    if (formData.last_four.length !== 4 || !/^\d+$/.test(formData.last_four)) {
      alert('末尾4桁は4桁の数字で入力してください');
      return;
    }

    const newCard: PaymentCard = {
      id: `card_${Date.now()}`,
      name: formData.name.trim(),
      company: formData.company,
      last_four: formData.last_four,
      created_at: new Date()
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    CardService.saveCards(updatedCards);

    // フォームリセット
    setFormData({ name: '', company: 'VISA', last_four: '' });
    setIsAddFormOpen(false);
  };

  const handleDeleteCard = (cardToDelete: PaymentCard) => {
    const confirmDelete = window.confirm(`${cardToDelete.name}を削除しますか？\n\n注意: このカードを使用しているサブスクリプションのカード設定もクリアされます。`);
    
    if (confirmDelete) {
      const updatedCards = cards.filter(card => card.id !== cardToDelete.id);
      setCards(updatedCards);
      CardService.saveCards(updatedCards);
      
      // TODO: サブスクリプションのcard_idもクリアする処理を追加
      alert('カードを削除しました');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">カード管理</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
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
            <h3 className="text-lg font-medium mb-4">新しいカードを追加</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カード名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: メインカード"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カード会社 *
                  </label>
                  <select
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CARD_COMPANIES.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    末尾4桁 *
                  </label>
                  <input
                    type="text"
                    value={formData.last_four}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_four: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                  />
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
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>
            
            <p className="text-xs text-gray-500 mt-2">
              ※ セキュリティのため、末尾4桁のみ保存されます
            </p>
          </div>
        )}

        {/* カード一覧 */}
        <div>
          <h3 className="text-lg font-medium mb-4">登録カード一覧</h3>
          {cards.length === 0 ? (
            <p className="text-gray-500 text-center py-8">登録されたカードがありません</p>
          ) : (
            <div className="space-y-3">
              {cards.map(card => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CARD</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{card.name}</div>
                      <div className="text-sm text-gray-500">
                        {card.company} •••• •••• •••• {card.last_four}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200"
                  >
                    削除
                  </button>
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
