"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Subscription } from "@/types/subscription";
import { SubscriptionService } from "@/lib/subscriptionService";
import SubscriptionList from "@/components/SubscriptionList";
import LoginButton from "@/components/LoginButton";

export default function Home() {
  const { data: session, status } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (status !== "loading" && session?.user?.email) {
        try {
          const subs = await SubscriptionService.getSubscriptions(
            session.user.email
          );
          setSubscriptions(subs);
        } catch (error) {
          console.error("サブスクリプション読み込みエラー:", error);
        }
      }
      setLoading(false);
    };

    loadSubscriptions();
  }, [status, session?.user?.email]);

  const updateSubscriptions = async () => {
    if (session?.user?.email) {
      try {
        const subs = await SubscriptionService.getSubscriptions(
          session.user.email
        );
        setSubscriptions(subs);
      } catch (error) {
        console.error("サブスクリプション更新エラー:", error);
      }
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  // 未ログインの場合
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            サブスクリプション管理
          </h1>
          <p className="text-gray-600 mb-8">
            サブスクリプションサービスの支払いを管理しましょう
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                サブスクリプション管理
              </h1>
              <p className="text-gray-600">
                {session.user?.name || session.user?.email}
                さんのサブスクリプション
              </p>
            </div>
            <LoginButton />
          </div>
        </header>

        <SubscriptionList
          subscriptions={subscriptions}
          onUpdate={updateSubscriptions}
        />
      </div>
    </div>
  );
}
