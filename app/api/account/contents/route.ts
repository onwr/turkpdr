import { NextResponse } from "next/server";

import {
  generateUniqueSlug,
  isRichContentEmpty,
  syncContentTags,
  validateContentInput,
} from "@/lib/admin/content-utils";
import { requireAuth } from "@/lib/api/auth";
import { notifyPendingContent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getAccountContents } from "@/lib/queries/account";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";

type ShareContentBody = {
  title?: string;
  summary?: string | null;
  content?: string | null;
  coverImage?: string | null;
  categoryId?: string | null;
  tags?: string[];
};

const MAX_TAGS = 12;
const MAX_TAG_LENGTH = 80;

function validateTags(tags?: string[]): string | null {
  if (!tags) return null;

  const cleaned = [
    ...new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
  ];

  if (cleaned.length > MAX_TAGS) {
    return `En fazla ${MAX_TAGS} etiket eklenebilir.`;
  }

  if (cleaned.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    return `Etiketler en fazla ${MAX_TAG_LENGTH} karakter olabilir.`;
  }

  return null;
}

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const contents = await getAccountContents(auth.user.id);
  return NextResponse.json({ contents });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  let body: ShareContentBody;
  try {
    body = (await request.json()) as ShareContentBody;
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

  const tagsError = validateTags(body.tags);
  if (tagsError) {
    return NextResponse.json({ error: tagsError }, { status: 400 });
  }

  if (isRichContentEmpty(body.content)) {
    return NextResponse.json(
      { error: "İçerik alanı boş olamaz." },
      { status: 400 }
    );
  }

  if (body.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, type: "ARTICLE" },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Geçersiz kategori seçildi." },
        { status: 400 }
      );
    }
  }

  const slug = await generateUniqueSlug(body.title!.trim());

  const content = await prisma.content.create({
    data: {
      title: body.title!.trim(),
      slug,
      summary: body.summary?.trim() || null,
      content: body.content!.trim(),
      coverImage: body.coverImage?.trim() || null,
      type: "ARTICLE",
      status: "PENDING",
      authorId: auth.user.id,
      categoryId: body.categoryId || null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    },
  });

  if (body.tags?.length) {
    await syncContentTags(content.id, body.tags);
  }

  void notifyPendingContent({
    title: content.title,
    contentId: content.id,
  });

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.CONTENT_CREATED,
    entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
    entityId: content.id,
    description: `"${content.title}" içeriği oluşturuldu`,
    metadata: { status: content.status, source: "account" },
  });

  return NextResponse.json(
    {
      message: "Paylaşımınız onay için gönderildi.",
      content,
    },
    { status: 201 }
  );
}
