"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notificationTypeLabels, type NotificationItem } from "@/types/notifications";
import { cn } from "@/lib/utils";

function formatNotificationDate(date: string): string {
  return new Date(date).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type AccountRecentNotificationsProps = {
  items: NotificationItem[];
  unreadCount: number;
};

export function AccountRecentNotifications({
  items,
  unreadCount,
}: AccountRecentNotificationsProps) {
  const router = useRouter();

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/account/notifications/${notification.id}/read`, {
          method: "PATCH",
        });
      } catch {
        // devam et
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-brand-blue" />
            Son Bildirimler
          </CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `${unreadCount} okunmamış bildirim`
              : "Güncel bildirimleriniz"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl" asChild>
          <Link href="/hesabim/bildirimler">Tümünü gör</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            Henüz bildirim yok.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => void handleClick(notification)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 px-6 py-4 text-left transition-colors hover:bg-slate-50",
                    !notification.isRead && "bg-brand-blue/5"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {notificationTypeLabels[notification.type]}
                    </Badge>
                    {!notification.isRead && (
                      <span className="size-2 rounded-full bg-brand-blue" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-brand-navy">
                    {notification.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
