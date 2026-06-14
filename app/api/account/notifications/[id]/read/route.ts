import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import {
  getUserUnreadNotificationCount,
  markUserNotificationRead,
  serializeNotification,
} from "@/lib/notifications";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const notification = await markUserNotificationRead(auth.user.id, id);

    if (!notification) {
      return NextResponse.json(
        { error: "Bildirim bulunamadı." },
        { status: 404 }
      );
    }

    const unreadCount = await getUserUnreadNotificationCount(auth.user.id);

    return NextResponse.json({
      notification: serializeNotification(notification),
      unreadCount,
      message: "Bildirim okundu olarak işaretlendi.",
    });
  } catch {
    return NextResponse.json(
      { error: "Bildirim güncellenemedi." },
      { status: 500 }
    );
  }
}
