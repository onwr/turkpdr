import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  getUnreadNotificationCount,
  markNotificationRead,
  serializeNotification,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const existing = await prisma.notification.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Bildirim bulunamadı." },
      { status: 404 }
    );
  }

  try {
    const notification = await markNotificationRead(id);
    const unreadCount = await getUnreadNotificationCount();

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
