import type { UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { userStatusLabels } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_STATUSES: UserStatus[] = ["ACTIVE", "PASSIVE", "BANNED"];

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: { status?: UserStatus };
  try {
    body = (await request.json()) as { status?: UserStatus };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  if (id === auth.user.id && body.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Kendi hesabınızı pasif veya yasaklı yapamazsınız." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status: body.status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        _count: { select: { contents: true } },
      },
    });

    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.USER_STATUS_CHANGED,
      entityType: ACTIVITY_ENTITY_TYPES.USER,
      entityId: user.id,
      description: `${existing.name} kullanıcısının durumu ${userStatusLabels[existing.status]} → ${userStatusLabels[user.status]} olarak değiştirildi`,
      metadata: { from: existing.status, to: user.status },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        contentCount: user._count.contents,
      },
      message: "Kullanıcı durumu güncellendi.",
    });
  } catch {
    return NextResponse.json(
      { error: "Durum güncellenemedi." },
      { status: 500 }
    );
  }
}
