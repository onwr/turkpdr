import type { DictionaryStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
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
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

const VALID_STATUSES: DictionaryStatus[] = ["DRAFT", "PUBLISHED"];

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status") as DictionaryStatus | null;
  const category = searchParams.get("category")?.trim();

  const where: Prisma.DictionaryTermWhereInput = {
    ...NOT_DELETED_WHERE,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  if (category) {
    where.category = { equals: category, mode: "insensitive" };
  }

  const [terms, total] = await Promise.all([
    prisma.dictionaryTerm.findMany({
      where,
      skip,
      take: limit,
      orderBy: { title: "asc" },
    }),
    prisma.dictionaryTerm.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, limit);

  return NextResponse.json({
    terms: terms.map(serializeDictionaryTerm),
    ...meta,
  });
}

export async function POST(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  let body: DictionaryInput;
  try {
    body = (await request.json()) as DictionaryInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateDictionaryInput(body, true);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const slug = await generateUniqueDictionarySlug(body.title!.trim());
  const seoPayload = extractDictionarySeoPayload(body);
  const status = body.status ?? "DRAFT";
  const scheduledAt = parseScheduledAtInput(body.scheduledAt);
  const publishFields = resolveDictionaryPublishFields({
    status,
    scheduledAt,
  });

  const term = await prisma.dictionaryTerm.create({
    data: {
      title: body.title!.trim(),
      slug,
      shortDescription: body.shortDescription?.trim() || null,
      content: body.content ?? null,
      category: body.category?.trim() || null,
      status: publishFields.status,
      scheduledAt: publishFields.scheduledAt,
      ...(seoPayload ?? {}),
    },
  });

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.DICTIONARY_CREATED,
    entityType: ACTIVITY_ENTITY_TYPES.DICTIONARY,
    entityId: term.id,
    description: `"${term.title}" sözlük terimi oluşturuldu`,
    metadata: { slug: term.slug },
  });

  return NextResponse.json(
    { term: serializeDictionaryTerm(term), message: "Terim oluşturuldu." },
    { status: 201 }
  );
}
