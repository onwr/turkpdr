"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { AdminListAlerts } from "@/components/admin/shared/admin-list-alerts";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";
import {
  USER_NOTIFICATION_TYPES,
  notificationTypeLabels,
  userNotificationTypeLabels,
  type AccountNotificationFilter,
  type NotificationItem,
  type UserNotificationType,
} from "@/types/notifications";

function formatNotificationDate(date: string): string {
  return new Date(date).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const filterOptions: { value: AccountNotificationFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "unread", label: "Okunmamış" },
  { value: "read", label: "Okunmuş" },
];

export function AccountNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] =
    useState<AccountNotificationFilter>("all");
  const [typeFilter, setTypeFilter] = useState<UserNotificationType | "">("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("filter", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    appendListPagination(params, page);

    try {
      const res = await fetch(`/api/account/notifications?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bildirimler yüklenemedi.");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("filter", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    appendListPagination(params, page);

    try {
      const res = await fetch(
        `/api/account/notifications/read-all?${params.toString()}`,
        { method: "PATCH" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız.");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSuccess(data.message || "Tüm bildirimler okundu.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setActionLoading(false);
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
          setUnreadCount(data.unreadCount);
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notification.id ? { ...item, isRead: true } : item
            )
          );
        }
      } catch {
        // devam et
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-navy sm:text-xl">
            Bildirimlerim
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hesabınızla ilgili tüm bildirimleri buradan takip edin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => void fetchNotifications()}
            aria-label="Yenile"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
          {unreadCount > 0 && (
            <Button
              className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
              disabled={actionLoading}
              onClick={() => void markAllRead()}
            >
              <CheckCheck className="size-4" />
              Tümünü Okundu Yap
            </Button>
          )}
        </div>
      </div>

      <AdminListAlerts error={error} success={success} />

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as AccountNotificationFilter);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Durum filtresi"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as UserNotificationType | "");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Tür filtresi"
        >
          <option value="">Tüm Türler</option>
          {USER_NOTIFICATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {userNotificationTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-brand-blue" />
            Bildirim Listesi
          </CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `${unreadCount} okunmamış bildirim`
              : "Tüm bildirimler okundu"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Yükleniyor...
            </div>
          ) : error && notifications.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground">
              Bildirimler yüklenemedi.
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground">
              Henüz bildirim yok.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void handleNotificationClick(notification)}
                    className={cn(
                      "flex w-full flex-col gap-2 px-6 py-4 text-left transition-colors hover:bg-slate-50",
                      !notification.isRead && "bg-brand-blue/5"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {notificationTypeLabels[notification.type]}
                      </Badge>
                      <Badge
                        variant={notification.isRead ? "outline" : "default"}
                        className="text-xs"
                      >
                        {notification.isRead ? "Okundu" : "Okunmadı"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="font-medium text-brand-navy">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {notification.actionUrl && (
                      <span className="text-xs font-medium text-brand-blue">
                        Detaya git →
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
