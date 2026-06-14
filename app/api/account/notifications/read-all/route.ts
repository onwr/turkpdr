import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import {
  getUserNotificationsPaginated,
  getUserUnreadNotificationCount,
  markAllUserNotificationsRead,
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

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);
  const filter = parseNotificationFilter(searchParams.get("filter"));
  const type = parseNotificationType(searchParams.get("type"));

  try {
    await markAllUserNotificationsRead(auth.user.id);

    const [{ notifications, total }, unreadCount] = await Promise.all([
      getUserNotificationsPaginated(auth.user.id, {
        page,
        limit,
        filter,
        type,
      }),
      getUserUnreadNotificationCount(auth.user.id),
    ]);
    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      notifications,
      unreadCount,
      message: "Tüm bildirimler okundu olarak işaretlendi.",
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Bildirimler güncellenemedi." },
      { status: 500 }
    );
  }
}
