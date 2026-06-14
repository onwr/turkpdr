import type { ContentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canDeleteContent,
  requireContentManager,
} from "@/lib/admin/api-auth";
import { generateUniqueModelSlug } from "@/lib/admin/slug";
import {
  extractTestSeoPayload,
  serializeAdminTest,
  type TestInput,
} from "@/lib/admin/test-utils";
import { prisma } from "@/lib/prisma";
import {
  parseScheduledAtInput,
  resolveTestPublishFields,
} from "@/lib/scheduling/utils";
import {
  NOT_DELETED_WHERE,
  softDeleteEntity,
  TrashEntityError,
} from "@/lib/trash/utils";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_STATUSES: ContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
];

function validateTestInput(body: TestInput): string | null {
  if (body.title !== undefined && !body.title.trim()) {
    return "Test başlığı boş olamaz.";
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return "Geçersiz test durumu.";
  }
  if (
    body.questionCount !== undefined &&
    body.questionCount !== null &&
    (body.questionCount < 0 || !Number.isInteger(body.questionCount))
  ) {
    return "Soru sayısı geçerli bir tam sayı olmalıdır.";
  }
  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const test = await prisma.test.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ test: serializeAdminTest(test) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: TestInput;
  try {
    body = (await request.json()) as TestInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateTestInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const existing = await prisma.test.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    select: { id: true, title: true, status: true, scheduledAt: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });
  }

  const updateData: {
    title?: string;
    slug?: string;
    description?: string | null;
    image?: string | null;
    duration?: string | null;
    questionCount?: number | null;
    iframeUrl?: string | null;
    status?: ContentStatus;
    categoryId?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    ogImage?: string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean;
    scheduledAt?: Date | null;
  } = {};

  if (body.title !== undefined) {
    updateData.title = body.title.trim();
    updateData.slug = await generateUniqueModelSlug(
      body.title.trim(),
      "test",
      id
    );
  }
  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null;
  }
  if (body.image !== undefined) updateData.image = body.image?.trim() || null;
  if (body.duration !== undefined) {
    updateData.duration = body.duration?.trim() || null;
  }
  if (body.questionCount !== undefined) {
    updateData.questionCount = body.questionCount;
  }
  if (body.iframeUrl !== undefined) {
    updateData.iframeUrl = body.iframeUrl?.trim() || null;
  }
  const nextStatus = body.status ?? existing.status;
  const scheduledAt =
    body.scheduledAt !== undefined
      ? parseScheduledAtInput(body.scheduledAt)
      : undefined;

  if (body.status !== undefined || body.scheduledAt !== undefined) {
    const publishFields = resolveTestPublishFields({
      status: nextStatus,
      scheduledAt:
        scheduledAt !== undefined ? scheduledAt : existing.scheduledAt,
    });

    if (body.status !== undefined) {
      updateData.status = publishFields.status;
    }
    updateData.scheduledAt = publishFields.scheduledAt;
  }

  if (body.categoryId !== undefined) {
    updateData.categoryId = body.categoryId || null;
  }

  const seoPayload = extractTestSeoPayload(body);
  if (seoPayload) {
    Object.assign(updateData, seoPayload);
  }

  const test = await prisma.test.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    test: serializeAdminTest(test),
    message: "Test güncellendi.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  if (!canDeleteContent(auth.user.role)) {
    return NextResponse.json(
      { error: "Test silme yetkisi yalnızca yöneticilere aittir." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const result = await softDeleteEntity("tests", id, auth.user.id);

    return NextResponse.json({
      message: `"${result.title}" çöp kutusuna taşındı.`,
    });
  } catch (error) {
    if (error instanceof TrashEntityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Test silinemedi." }, { status: 500 });
  }
}
