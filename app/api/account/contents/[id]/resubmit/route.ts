import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { canAuthorResubmit } from "@/lib/content-review";
import { notifyPendingContent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const existing = await prisma.content.findFirst({
    where: {
      id,
      authorId: auth.user.id,
      ...NOT_DELETED_WHERE,
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "İçerik bulunamadı." },
      { status: 404 }
    );
  }

  if (!canAuthorResubmit(existing.status)) {
    return NextResponse.json(
      { error: "Bu içerik tekrar onaya gönderilemez." },
      { status: 400 }
    );
  }

  const content = await prisma.content.update({
    where: { id },
    data: { status: "PENDING" },
    select: {
      id: true,
      title: true,
      status: true,
      reviewNote: true,
      reviewedAt: true,
      reviewedById: true,
    },
  });

  void notifyPendingContent({
    title: content.title,
    contentId: content.id,
  });

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.CONTENT_RESUBMITTED,
    entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
    entityId: content.id,
    description: `"${content.title}" tekrar onaya gönderildi`,
  });

  return NextResponse.json({
    message: "İçeriğiniz tekrar onaya gönderildi.",
    content,
  });
}
