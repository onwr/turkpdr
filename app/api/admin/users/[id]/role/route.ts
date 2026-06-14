import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { userRoleLabels } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_ROLES: UserRole[] = ["ADMIN", "EDITOR", "AUTHOR", "MEMBER"];

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: { role?: UserRole };
  try {
    body = (await request.json()) as { role?: UserRole };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  if (!body.role || !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Geçersiz rol." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  if (existing.id === auth.user.id && body.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Kendi yönetici rolünüzü düşüremezsiniz." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role: body.role },
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
      action: ACTIVITY_ACTIONS.USER_ROLE_CHANGED,
      entityType: ACTIVITY_ENTITY_TYPES.USER,
      entityId: user.id,
      description: `${existing.name} kullanıcısının rolü ${userRoleLabels[existing.role]} → ${userRoleLabels[user.role]} olarak değiştirildi`,
      metadata: { from: existing.role, to: user.role },
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
      message: "Kullanıcı rolü güncellendi.",
    });
  } catch {
    return NextResponse.json(
      { error: "Rol güncellenemedi." },
      { status: 500 }
    );
  }
}
