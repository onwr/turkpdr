import type { ContentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canDeleteContent,
  requireContentManager,
} from "@/lib/admin/api-auth";
import {
  contentInclude,
  extractSeoPayload,
  generateUniqueSlug,
  prepareContentInputForStorage,
  serializeContent,
  syncContentTags,
  validateContentInput,
  type ContentInput,
} from "@/lib/admin/content-utils";
import { notifyPendingContent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  parseScheduledAtInput,
  resolveContentPublishFields,
  isScheduledInFuture,
} from "@/lib/scheduling/utils";
import {
  NOT_DELETED_WHERE,
  softDeleteEntity,
  TrashEntityError,
} from "@/lib/trash/utils";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const content = await prisma.content.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    include: contentInclude,
  });

  if (!content) {
    return NextResponse.json(
      { error: "İçerik bulunamadı." },
      { status: 404 }
    );
  }

  return NextResponse.json({ content: serializeContent(content) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const existing = await prisma.content.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    select: { id: true, title: true, status: true, publishedAt: true, scheduledAt: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "İçerik bulunamadı." },
      { status: 404 }
    );
  }

  let body: ContentInput;
  try {
    body = (await request.json()) as ContentInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateContentInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  body = prepareContentInputForStorage(body);

  const updateData: {
    title?: string;
    slug?: string;
    summary?: string | null;
    content?: string | null;
    coverImage?: string | null;
    type?: ContentInput["type"];
    status?: ContentStatus;
    featured?: boolean;
    categoryId?: string | null;
    publishedAt?: Date | null;
    scheduledAt?: Date | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    ogImage?: string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean;
  } = {};

  if (body.title !== undefined) {
    updateData.title = body.title.trim();
    updateData.slug = await generateUniqueSlug(body.title.trim(), id);
  }

  if (body.summary !== undefined) updateData.summary = body.summary?.trim() || null;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.featured !== undefined) updateData.featured = body.featured;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;

  const nextStatus = body.status ?? existing.status;
  const scheduledAt =
    body.scheduledAt !== undefined
      ? parseScheduledAtInput(body.scheduledAt)
      : undefined;

  if (body.status !== undefined || body.scheduledAt !== undefined) {
    const publishFields = resolveContentPublishFields({
      status: nextStatus,
      scheduledAt:
        scheduledAt !== undefined ? scheduledAt : existing.scheduledAt,
      existingPublishedAt: existing.publishedAt,
    });

    if (body.status !== undefined) {
      updateData.status = publishFields.status;
    }
    updateData.publishedAt = publishFields.publishedAt;
    updateData.scheduledAt = publishFields.scheduledAt;
  }

  const seoPayload = extractSeoPayload(body);
  Object.assign(updateData, seoPayload);

  await prisma.content.update({
    where: { id },
    data: updateData,
  });

  if (
    body.status === "PENDING" &&
    existing.status !== "PENDING"
  ) {
    void notifyPendingContent({
      title: body.title?.trim() ?? existing.title,
      contentId: id,
    });
  }

  if (body.tags !== undefined) {
    await syncContentTags(id, body.tags);
  }

  const updatedTitle = body.title?.trim() ?? existing.title;

  if (
    body.status === "PUBLISHED" &&
    existing.status !== "PUBLISHED" &&
    !isScheduledInFuture(updateData.scheduledAt ?? null)
  ) {
    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.CONTENT_PUBLISHED,
      entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
      entityId: id,
      description: `"${updatedTitle}" yayınlandı`,
    });
  } else if (body.status === "REJECTED" && existing.status !== "REJECTED") {
    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.CONTENT_REJECTED,
      entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
      entityId: id,
      description: `"${updatedTitle}" reddedildi`,
    });
  } else {
    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.CONTENT_UPDATED,
      entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
      entityId: id,
      description: `"${updatedTitle}" içeriği güncellendi`,
    });
  }

  const content = await prisma.content.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    include: contentInclude,
  });

  return NextResponse.json({ content: serializeContent(content!) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  if (!canDeleteContent(auth.user.role)) {
    return NextResponse.json(
      { error: "İçerik silme yetkisi yalnızca yöneticilere aittir." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const result = await softDeleteEntity("contents", id, auth.user.id);

    return NextResponse.json({
      message: `"${result.title}" çöp kutusuna taşındı.`,
    });
  } catch (error) {
    if (error instanceof TrashEntityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "İçerik silinemedi." },
      { status: 500 }
    );
  }
}
