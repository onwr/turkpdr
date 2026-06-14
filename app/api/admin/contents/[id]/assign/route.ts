import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import { contentInclude, serializeContent } from "@/lib/admin/content-utils";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: { editorId?: string | null };
  try {
    body = (await request.json()) as { editorId?: string | null };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const existing = await prisma.content.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, title: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "İçerik bulunamadı." },
      { status: 404 }
    );
  }

  if (body.editorId) {
    const editor = await prisma.user.findFirst({
      where: {
        id: body.editorId,
        status: "ACTIVE",
        role: { in: ["ADMIN", "EDITOR"] },
      },
      select: { id: true, name: true },
    });

    if (!editor) {
      return NextResponse.json(
        { error: "Geçerli bir editör veya yönetici seçmelisiniz." },
        { status: 400 }
      );
    }
  }

  const content = await prisma.content.update({
    where: { id },
    data: {
      assignedEditorId: body.editorId ?? null,
    },
    include: contentInclude,
  });

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.CONTENT_ASSIGNED,
    entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
    entityId: id,
    description: body.editorId
      ? `"${existing.title}" içeriği bir editöre atandı`
      : `"${existing.title}" içeriğinin editör ataması kaldırıldı`,
    metadata: { assignedEditorId: body.editorId ?? null },
  });

  return NextResponse.json({ content: serializeContent(content) });
}
