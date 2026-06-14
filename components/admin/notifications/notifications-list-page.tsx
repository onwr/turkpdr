"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminConfirmDialog,
  type AdminConfirmState,
} from "@/components/admin/shared/admin-confirm-dialog";
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
import {
  notificationTypeLabels,
  type NotificationItem,
} from "@/types/notifications";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";

function formatNotificationDate(date: string): string {
  return new Date(date).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsListPage() {
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
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    appendListPagination(params, page);

    try {
      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
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
  }, [page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const params = new URLSearchParams();
    appendListPagination(params, page);

    try {
      const res = await fetch(
        `/api/admin/notifications?${params.toString()}`,
        { method: "PATCH" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız.");
      setNotifications(data.notifications);
      setUnreadCount(0);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSuccess(data.message || "Tüm bildirimler okundu.");
      setConfirmState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const requestMarkAllRead = () => {
    setConfirmState({
      title: "Tümünü Okundu Yap",
      description:
        "Tüm bildirimleri okundu olarak işaretlemek istediğinize emin misiniz?",
      confirmLabel: "Okundu Yap",
      onConfirm: markAllRead,
    });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
    } finally {
      setConfirmLoading(false);
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
        // devam et
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy sm:text-2xl">
            Bildirimler
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistem bildirimlerini görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="flex gap-2">
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
              onClick={requestMarkAllRead}
            >
              <CheckCheck className="size-4" />
              Tümünü Okundu Yap
            </Button>
          )}
        </div>
      </div>

      <AdminListAlerts error={error} success={success} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-brand-blue" />
            Tüm Bildirimler
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

      <AdminConfirmDialog
        state={confirmState}
        loading={confirmLoading || actionLoading}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        onConfirm={() => void handleConfirm()}
      />
    </AdminLayout>
  );
}
