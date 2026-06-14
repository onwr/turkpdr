import type { ContentStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
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
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";

const VALID_STATUSES: ContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
];

function validateTestInput(body: TestInput, isCreate = false): string | null {
  if (isCreate && !body.title?.trim()) {
    return "Test başlığı zorunludur.";
  }
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

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status") as ContentStatus | null;
  const categoryId = searchParams.get("categoryId");

  const where: Prisma.TestWhereInput = {
    ...NOT_DELETED_WHERE,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [tests, total] = await Promise.all([
    prisma.test.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.test.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, limit);

  return NextResponse.json({
    tests: tests.map(serializeAdminTest),
    ...meta,
  });
}

export async function POST(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  let body: TestInput;
  try {
    body = (await request.json()) as TestInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateTestInput(body, true);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const slug = await generateUniqueModelSlug(body.title!.trim(), "test");
  const seoPayload = extractTestSeoPayload(body);
  const status = body.status ?? "DRAFT";
  const scheduledAt = parseScheduledAtInput(body.scheduledAt);
  const publishFields = resolveTestPublishFields({
    status,
    scheduledAt,
  });

  const test = await prisma.test.create({
    data: {
      title: body.title!.trim(),
      slug,
      description: body.description?.trim() || null,
      image: body.image?.trim() || null,
      duration: body.duration?.trim() || null,
      questionCount: body.questionCount ?? null,
      iframeUrl: body.iframeUrl?.trim() || null,
      status: publishFields.status,
      scheduledAt: publishFields.scheduledAt,
      categoryId: body.categoryId || null,
      ...(seoPayload ?? {}),
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.TEST_CREATED,
    entityType: ACTIVITY_ENTITY_TYPES.TEST,
    entityId: test.id,
    description: `"${test.title}" testi oluşturuldu`,
    metadata: { slug: test.slug },
  });

  return NextResponse.json(
    { test: serializeAdminTest(test), message: "Test oluşturuldu." },
    { status: 201 }
  );
}
