import type { ContentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canPublishContent,
  requireContentManager,
} from "@/lib/admin/api-auth";
import { contentInclude, serializeContent } from "@/lib/admin/content-utils";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { validateReviewNote } from "@/lib/content-review";
import {
  notifyAuthorContentPublished,
  notifyAuthorContentRejected,
  notifyAuthorRevisionRequested,
  notifyPendingContent,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const validStatuses: ContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "REVISION_REQUESTED",
];

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: { status?: ContentStatus; reviewNote?: string | null };
  try {
    body = (await request.json()) as {
      status?: ContentStatus;
      reviewNote?: string | null;
    };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: "Geçersiz içerik durumu." },
      { status: 400 }
    );
  }

  const noteError = validateReviewNote(body.status, body.reviewNote);
  if (noteError) {
    return NextResponse.json({ error: noteError }, { status: 400 });
  }

  if (body.status === "PUBLISHED" && !canPublishContent(auth.user.role)) {
    return NextResponse.json(
      { error: "Yayınlama yetkiniz bulunmuyor." },
      { status: 403 }
    );
  }

  const existing = await prisma.content.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      authorId: true,
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "İçerik bulunamadı." },
      { status: 404 }
    );
  }

  const now = new Date();
  const updateData: {
    status: ContentStatus;
    publishedAt?: Date | null;
    reviewNote?: string | null;
    reviewedById?: string | null;
    reviewedAt?: Date | null;
  } = {
    status: body.status,
  };

  if (body.status === "PUBLISHED") {
    updateData.publishedAt =
      existing.status !== "PUBLISHED" ? now : undefined;
  } else {
    updateData.publishedAt = null;
  }

  if (body.status === "REJECTED" || body.status === "REVISION_REQUESTED") {
    updateData.reviewNote = body.reviewNote!.trim();
    updateData.reviewedById = auth.user.id;
    updateData.reviewedAt = now;
  }

  const content = await prisma.content.update({
    where: { id },
    data: updateData,
    include: contentInclude,
  });

  if (body.status === "PENDING" && existing.status !== "PENDING") {
    void notifyPendingContent({
      title: existing.title,
      contentId: id,
    });
  }

  if (body.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.CONTENT_PUBLISHED,
      entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
      entityId: id,
      description: `"${existing.title}" yayınlandı`,
    });
    void notifyAuthorContentPublished({
      authorId: existing.authorId,
      title: existing.title,
      contentSlug: existing.slug,
      contentType: existing.type,
    });
  } else if (body.status === "REJECTED" && existing.status !== "REJECTED") {
    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.CONTENT_REJECTED,
      entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
      entityId: id,
      description: `"${existing.title}" reddedildi`,
      metadata: { reviewNote: body.reviewNote?.trim() },
    });
    void notifyAuthorContentRejected({
      authorId: existing.authorId,
      title: existing.title,
      contentId: id,
      reviewNote: body.reviewNote!.trim(),
    });
  } else if (
    body.status === "REVISION_REQUESTED" &&
    existing.status !== "REVISION_REQUESTED"
  ) {
    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.CONTENT_REVISION_REQUESTED,
      entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
      entityId: id,
      description: `"${existing.title}" için revizyon istendi`,
      metadata: { reviewNote: body.reviewNote?.trim() },
    });
    void notifyAuthorRevisionRequested({
      authorId: existing.authorId,
      title: existing.title,
      contentId: id,
      reviewNote: body.reviewNote!.trim(),
    });
  }

  return NextResponse.json({ content: serializeContent(content) });
}
