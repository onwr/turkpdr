"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  notificationTypeLabels,
  type NotificationItem,
} from "@/types/notifications";
import { cn } from "@/lib/utils";

function formatNotificationDate(date: string): string {
  return new Date(date).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=5");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Sessizce başarısız — header çalışmaya devam etsin
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);
    const interval = setInterval(() => void fetchNotifications(), 60000);
    return () => {
      window.clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      window.setTimeout(() => {
        void fetchNotifications();
      }, 0);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        const res = await fetch(
          `/api/admin/notifications/${notification.id}/read`,
          { method: "PATCH" }
        );
        const data = await res.json();
        if (res.ok) {
          setUnreadCount(data.unreadCount);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n
            )
          );
        }
      } catch {
        // yönlendirme yine de devam etsin
      }
    }

    setOpen(false);

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="Bildirimler"
        aria-expanded={open}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-brand-navy">Bildirimler</p>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} yeni
              </Badge>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Bildirim bulunmuyor.
              </p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => void handleNotificationClick(notification)}
                      className={cn(
                        "w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                        !notification.isRead && "bg-brand-blue/5"
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {notificationTypeLabels[notification.type]}
                        </Badge>
                        {!notification.isRead && (
                          <span className="size-2 rounded-full bg-brand-blue" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-brand-navy">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatNotificationDate(notification.createdAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-xl text-brand-blue"
              asChild
            >
              <Link href="/admin/notifications" onClick={() => setOpen(false)}>
                <CheckCheck className="size-4" />
                Tüm bildirimleri gör
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
