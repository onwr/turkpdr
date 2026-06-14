import { NextResponse } from "next/server";

import {
  generateUniqueSlug,
  isRichContentEmpty,
  syncContentTags,
  prepareContentInputForStorage,
  validateContentInput,
} from "@/lib/admin/content-utils";
import { requireAuth } from "@/lib/api/auth";
import { canAuthorEditContent } from "@/lib/content-review";
import { prisma } from "@/lib/prisma";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

type RouteContext = { params: Promise<{ id: string }> };

type AccountContentBody = {
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

  const cleaned = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];

  if (cleaned.length > MAX_TAGS) {
    return `En fazla ${MAX_TAGS} etiket eklenebilir.`;
  }

  if (cleaned.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    return `Etiketler en fazla ${MAX_TAG_LENGTH} karakter olabilir.`;
  }

  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const content = await prisma.content.findFirst({
    where: {
      id,
      authorId: auth.user.id,
      ...NOT_DELETED_WHERE,
    },
    include: {
      category: { select: { id: true, name: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  if (!content) {
    return NextResponse.json(
      { error: "İçerik bulunamadı." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    content: {
      id: content.id,
      title: content.title,
      summary: content.summary,
      content: content.content,
      coverImage: content.coverImage,
      categoryId: content.categoryId,
      status: content.status,
      reviewNote: content.reviewNote,
      reviewedAt: content.reviewedAt?.toISOString() ?? null,
      reviewedBy: content.reviewedBy,
      tags: content.tags.map((item) => item.tag.name),
      category: content.category,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const existing = await prisma.content.findFirst({
    where: {
      id,
      authorId: auth.user.id,
      ...NOT_DELETED_WHERE,
    },
    select: { id: true, title: true, status: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "İçerik bulunamadı." },
      { status: 404 }
    );
  }

  if (!canAuthorEditContent(existing.status)) {
    return NextResponse.json(
      { error: "Bu içerik düzenlenemez." },
      { status: 403 }
    );
  }

  let body: AccountContentBody;
  try {
    body = (await request.json()) as AccountContentBody;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateContentInput(body, false);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  body = prepareContentInputForStorage(body);

  const tagsError = validateTags(body.tags);
  if (tagsError) {
    return NextResponse.json({ error: tagsError }, { status: 400 });
  }

  if (body.content !== undefined && isRichContentEmpty(body.content)) {
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

  const updateData: {
    title?: string;
    slug?: string;
    summary?: string | null;
    content?: string | null;
    coverImage?: string | null;
    categoryId?: string | null;
  } = {};

  if (body.title !== undefined) {
    updateData.title = body.title.trim();
    updateData.slug = await generateUniqueSlug(body.title.trim(), id);
  }
  if (body.summary !== undefined) {
    updateData.summary = body.summary?.trim() || null;
  }
  if (body.content !== undefined) {
    updateData.content = body.content?.trim() || null;
  }
  if (body.coverImage !== undefined) {
    updateData.coverImage = body.coverImage;
  }
  if (body.categoryId !== undefined) {
    updateData.categoryId = body.categoryId || null;
  }

  const content = await prisma.content.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      title: true,
      status: true,
      reviewNote: true,
    },
  });

  if (body.tags) {
    await syncContentTags(id, body.tags);
  }

  return NextResponse.json({
    message: "İçerik güncellendi.",
    content,
  });
}
