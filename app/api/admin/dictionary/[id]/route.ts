import type { DictionaryStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canDeleteContent,
  requireContentManager,
} from "@/lib/admin/api-auth";
import {
  generateUniqueDictionarySlug,
  serializeDictionaryTerm,
  validateDictionaryInput,
  extractDictionarySeoPayload,
  type DictionaryInput,
} from "@/lib/admin/dictionary-utils";
import { prisma } from "@/lib/prisma";
import {
  parseScheduledAtInput,
  resolveDictionaryPublishFields,
} from "@/lib/scheduling/utils";
import {
  NOT_DELETED_WHERE,
  softDeleteEntity,
  TrashEntityError,
} from "@/lib/trash/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const term = await prisma.dictionaryTerm.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
  });

  if (!term) {
    return NextResponse.json({ error: "Terim bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ term: serializeDictionaryTerm(term) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const existing = await prisma.dictionaryTerm.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    select: { id: true, title: true, status: true, scheduledAt: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Terim bulunamadı." }, { status: 404 });
  }

  let body: DictionaryInput;
  try {
    body = (await request.json()) as DictionaryInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateDictionaryInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const updateData: {
    title?: string;
    slug?: string;
    shortDescription?: string | null;
    content?: string | null;
    category?: string | null;
    status?: DictionaryStatus;
    seoTitle?: string | null;
    seoDescription?: string | null;
    ogImage?: string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean;
    scheduledAt?: Date | null;
  } = {};

  if (body.title !== undefined) {
    updateData.title = body.title.trim();
    updateData.slug = await generateUniqueDictionarySlug(body.title.trim(), id);
  }
  if (body.shortDescription !== undefined) {
    updateData.shortDescription = body.shortDescription?.trim() || null;
  }
  if (body.content !== undefined) updateData.content = body.content;
  if (body.category !== undefined) {
    updateData.category = body.category?.trim() || null;
  }
  const nextStatus = body.status ?? existing.status;
  const scheduledAt =
    body.scheduledAt !== undefined
      ? parseScheduledAtInput(body.scheduledAt)
      : undefined;

  if (body.status !== undefined || body.scheduledAt !== undefined) {
    const publishFields = resolveDictionaryPublishFields({
      status: nextStatus,
      scheduledAt:
        scheduledAt !== undefined ? scheduledAt : existing.scheduledAt,
    });

    if (body.status !== undefined) {
      updateData.status = publishFields.status;
    }
    updateData.scheduledAt = publishFields.scheduledAt;
  }

  const seoPayload = extractDictionarySeoPayload(body);
  if (seoPayload) {
    Object.assign(updateData, seoPayload);
  }

  const term = await prisma.dictionaryTerm.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    term: serializeDictionaryTerm(term),
    message: "Terim güncellendi.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  if (!canDeleteContent(auth.user.role)) {
    return NextResponse.json(
      { error: "Terim silme yetkisi yalnızca yöneticilere aittir." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const result = await softDeleteEntity("dictionary", id, auth.user.id);

    return NextResponse.json({
      message: `"${result.title}" çöp kutusuna taşındı.`,
    });
  } catch (error) {
    if (error instanceof TrashEntityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Terim silinemedi." }, { status: 500 });
  }
}
