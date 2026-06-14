"use client";

import { MessageSquare } from "lucide-react";

import { AccountStatCard } from "@/components/account/account-stat-card";
import { useMessageUnreadCount } from "@/components/messages/use-unread-count";

type AccountMessagesStatCardProps = {
  initialCount: number;
};

export function AccountMessagesStatCard({
  initialCount,
}: AccountMessagesStatCardProps) {
  const { count } = useMessageUnreadCount(true, initialCount);

  return (
    <AccountStatCard
      label="Okunmamış Mesaj"
      value={count}
      icon={MessageSquare}
      accent="rose"
      href="/hesabim/mesajlar"
    />
  );
}
