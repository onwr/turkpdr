import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import {
  getNotificationsPaginated,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from "@/lib/notifications";

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);

  try {
    const [{ notifications, total }, unreadCount] = await Promise.all([
      getNotificationsPaginated(page, limit),
      getUnreadNotificationCount(),
    ]);

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

export async function PATCH(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);

  try {
    await markAllNotificationsRead();
    const { notifications, total } = await getNotificationsPaginated(
      page,
      limit
    );
    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      notifications,
      unreadCount: 0,
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
