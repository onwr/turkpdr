import type { ContentStatus, ContentType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import {
  contentInclude,
  extractSeoPayload,
  generateUniqueSlug,
  serializeContent,
  syncContentTags,
  prepareContentInputForStorage,
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
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const type = searchParams.get("type") as ContentType | null;
  const status = searchParams.get("status") as ContentStatus | null;
  const categoryId = searchParams.get("categoryId")?.trim();
  const authorId = searchParams.get("authorId")?.trim();
  const assignment = searchParams.get("assignment")?.trim();

  const where: Prisma.ContentWhereInput = {
    ...NOT_DELETED_WHERE,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (assignment === "mine") {
    where.assignedEditorId = auth.user.id;
  }

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      skip,
      take: limit,
      include: contentInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.content.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, limit);

  return NextResponse.json({
    contents: contents.map(serializeContent),
    ...meta,
  });
}

export async function POST(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  let body: ContentInput;
  try {
    body = (await request.json()) as ContentInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateContentInput(body, true);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  body = prepareContentInputForStorage(body);

  const slug = await generateUniqueSlug(body.title!.trim());
  const status = body.status ?? "DRAFT";
  const scheduledAt = parseScheduledAtInput(body.scheduledAt);
  const publishFields = resolveContentPublishFields({
    status,
    scheduledAt,
  });
  const seoPayload = extractSeoPayload(body);

  const content = await prisma.content.create({
    data: {
      title: body.title!.trim(),
      slug,
      summary: body.summary?.trim() || null,
      content: body.content ?? null,
      coverImage: body.coverImage ?? null,
      type: body.type ?? "ARTICLE",
      status: publishFields.status,
      featured: body.featured ?? false,
      authorId: auth.user.id,
      categoryId: body.categoryId || null,
      publishedAt: publishFields.publishedAt,
      scheduledAt: publishFields.scheduledAt,
      ...seoPayload,
    },
    include: contentInclude,
  });

  if (body.tags?.length) {
    await syncContentTags(content.id, body.tags);
  }

  if (status === "PENDING") {
    void notifyPendingContent({
      title: content.title,
      contentId: content.id,
    });
  }

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.CONTENT_CREATED,
    entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
    entityId: content.id,
    description: `"${content.title}" içeriği oluşturuldu`,
    metadata: { type: content.type, status },
  });

  if (
    status === "PUBLISHED" &&
    !isScheduledInFuture(publishFields.scheduledAt)
  ) {
    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.CONTENT_PUBLISHED,
      entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
      entityId: content.id,
      description: `"${content.title}" yayınlandı`,
    });
  }

  const fullContent = await prisma.content.findUnique({
    where: { id: content.id },
    include: contentInclude,
  });

  return NextResponse.json(
    { content: serializeContent(fullContent!) },
    { status: 201 }
  );
}
