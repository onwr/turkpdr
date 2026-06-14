import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import {
  getUserNotifications,
  getUserNotificationsPaginated,
  getUserUnreadNotificationCount,
} from "@/lib/notifications";
import {
  USER_NOTIFICATION_TYPES,
  type AccountNotificationFilter,
  type UserNotificationType,
} from "@/types/notifications";

function parseNotificationFilter(
  value: string | null
): AccountNotificationFilter {
  if (value === "unread" || value === "read") return value;
  return "all";
}

function parseNotificationType(
  value: string | null
): UserNotificationType | undefined {
  if (!value) return undefined;
  return USER_NOTIFICATION_TYPES.includes(value as UserNotificationType)
    ? (value as UserNotificationType)
    : undefined;
}

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const filter = parseNotificationFilter(searchParams.get("filter"));
  const type = parseNotificationType(searchParams.get("type"));
  const listLimit = searchParams.get("limit");

  try {
    const unreadCount = await getUserUnreadNotificationCount(auth.user.id);

    if (listLimit) {
      const take = Math.min(
        20,
        Math.max(1, parseInt(listLimit, 10) || 5)
      );
      const notifications = await getUserNotifications(auth.user.id, take);

      return NextResponse.json({
        notifications,
        unreadCount,
      });
    }

    const { notifications, total } = await getUserNotificationsPaginated(
      auth.user.id,
      { page, limit, filter, type }
    );
    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      notifications,
      unreadCount,
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Bildirimler yüklenemedi." },
      { status: 500 }
    );
  }
}
