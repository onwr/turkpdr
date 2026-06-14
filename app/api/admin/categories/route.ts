import type { ContentType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import { generateUniqueModelSlug } from "@/lib/admin/slug";
import { prisma } from "@/lib/prisma";

const VALID_TYPES: ContentType[] = [
  "NEWS",
  "ARTICLE",
  "GUIDE",
  "METAPHOR",
  "PSIKO_SANAT",
  "VIDEO",
  "FILE",
];

function serializeCategory(category: {
  id: string;
  name: string;
  slug: string;
  type: ContentType;
  createdAt: Date;
  updatedAt: Date;
  _count: { contents: number; tests: number };
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    type: category.type,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    _count: category._count,
  };
}

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const type = searchParams.get("type") as ContentType | null;

  const where: Prisma.CategoryWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type && VALID_TYPES.includes(type)) {
    where.type = type;
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: { select: { contents: true, tests: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, limit);

  return NextResponse.json({
    categories: categories.map(serializeCategory),
    ...meta,
  });
}

export async function POST(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  let body: { name?: string; type?: ContentType };
  try {
    body = (await request.json()) as { name?: string; type?: ContentType };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "Kategori adı zorunludur." },
      { status: 400 }
    );
  }

  if (!body.type || !VALID_TYPES.includes(body.type)) {
    return NextResponse.json(
      { error: "Geçersiz kategori türü." },
      { status: 400 }
    );
  }

  const slug = await generateUniqueModelSlug(body.name.trim(), "category");

  const category = await prisma.category.create({
    data: {
      name: body.name.trim(),
      slug,
      type: body.type,
    },
    include: {
      _count: { select: { contents: true, tests: true } },
    },
  });

  return NextResponse.json(
    { category: serializeCategory(category), message: "Kategori oluşturuldu." },
    { status: 201 }
  );
}
