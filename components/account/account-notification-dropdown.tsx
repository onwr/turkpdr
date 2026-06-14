"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import { useAccountNotificationCount } from "@/components/account/use-account-notification-count";
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

type AccountNotificationDropdownProps = {
  layout?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function AccountNotificationDropdown({
  layout = "desktop",
  onNavigate,
}: AccountNotificationDropdownProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { count: unreadCount, refresh, setCount } = useAccountNotificationCount();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/notifications?limit=5");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotifications(data.notifications);
      setCount(data.unreadCount ?? 0);
    } catch {
      // header çalışmaya devam etsin
    } finally {
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);
    return () => window.clearTimeout(timeoutId);
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
      void fetchNotifications();
      void refresh();
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        const res = await fetch(
          `/api/account/notifications/${notification.id}/read`,
          { method: "PATCH" }
        );
        const data = await res.json();
        if (res.ok) {
          setCount(data.unreadCount ?? 0);
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notification.id ? { ...item, isRead: true } : item
            )
          );
        }
      } catch {
        // yönlendirme devam etsin
      }
    }

    setOpen(false);
    onNavigate?.();

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl border border-border/60 transition-colors hover:bg-brand-blue/5",
          layout === "desktop" ? "size-9" : "size-10"
        )}
        aria-label={
          unreadCount > 0
            ? `Bildirimler, ${unreadCount} okunmamış`
            : "Bildirimler"
        }
        aria-expanded={open}
      >
        <Bell className="size-4 text-brand-navy" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 sm:w-96",
            layout === "desktop" ? "right-0 top-full" : "left-0 top-full"
          )}
        >
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
              <Link
                href="/hesabim/bildirimler"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
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
