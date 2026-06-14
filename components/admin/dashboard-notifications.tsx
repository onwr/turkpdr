import Link from "next/link";
import { Bell } from "lucide-react";

import { formatContentDate } from "@/lib/admin/content-display";
import { notificationTypeLabels } from "@/types/notifications";
import type { NotificationItem } from "@/types/notifications";
import { cn } from "@/lib/utils";

const typeStyles: Record<NotificationItem["type"], string> = {
  NEW_COMMENT: "bg-sky-50 text-sky-600",
  NEW_USER: "bg-indigo-50 text-indigo-600",
  PENDING_CONTENT: "bg-amber-50 text-amber-600",
  NEW_FILE: "bg-violet-50 text-violet-600",
  CONTENT_PUBLISHED: "bg-emerald-50 text-emerald-600",
  CONTENT_REJECTED: "bg-red-50 text-red-600",
  CONTENT_REVISION_REQUESTED: "bg-orange-50 text-orange-600",
  NEW_MESSAGE: "bg-blue-50 text-blue-600",
  SYSTEM: "bg-slate-100 text-slate-600",
};

type DashboardNotificationsProps = {
  notifications: NotificationItem[];
};

export function DashboardNotifications({
  notifications,
}: DashboardNotificationsProps) {
  return (
    <section
      aria-labelledby="dashboard-notifications-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2
            id="dashboard-notifications-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            Bildirimler
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Son sistem bildirimleri
          </p>
        </div>
        <Link
          href="/admin/notifications"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Tümü
        </Link>
      </div>

      {notifications.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Bildirim bulunmuyor.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {notifications.map((notification) => {
            const content = (
              <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    typeStyles[notification.type]
                  )}
                >
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-brand-navy">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="size-2 rounded-full bg-brand-blue" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {notificationTypeLabels[notification.type]} ·{" "}
                    {formatContentDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            );

            return (
              <li key={notification.id}>
                {notification.actionUrl ? (
                  <Link
                    href={notification.actionUrl}
                    className="block transition-colors hover:bg-slate-50"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
