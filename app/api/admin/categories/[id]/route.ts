import type { ContentType } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canDeleteContent,
  requireContentManager,
} from "@/lib/admin/api-auth";
import { generateUniqueModelSlug } from "@/lib/admin/slug";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { contents: true, tests: true } },
    },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Kategori bulunamadı." },
      { status: 404 }
    );
  }

  return NextResponse.json({ category: serializeCategory(category) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: { name?: string; type?: ContentType };
  try {
    body = (await request.json()) as { name?: string; type?: ContentType };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Kategori bulunamadı." },
      { status: 404 }
    );
  }

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json(
      { error: "Kategori adı boş olamaz." },
      { status: 400 }
    );
  }

  if (body.type !== undefined && !VALID_TYPES.includes(body.type)) {
    return NextResponse.json(
      { error: "Geçersiz kategori türü." },
      { status: 400 }
    );
  }

  const updateData: { name?: string; slug?: string; type?: ContentType } = {};

  if (body.name !== undefined) {
    updateData.name = body.name.trim();
    updateData.slug = await generateUniqueModelSlug(
      body.name.trim(),
      "category",
      id
    );
  }

  if (body.type !== undefined) {
    updateData.type = body.type;
  }

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      _count: { select: { contents: true, tests: true } },
    },
  });

  return NextResponse.json({
    category: serializeCategory(category),
    message: "Kategori güncellendi.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  if (!canDeleteContent(auth.user.role)) {
    return NextResponse.json(
      { error: "Kategori silme yetkisi yalnızca yöneticilere aittir." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { contents: true, tests: true } },
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Kategori bulunamadı." },
      { status: 404 }
    );
  }

  if (existing._count.contents > 0 || existing._count.tests > 0) {
    return NextResponse.json(
      {
        error:
          "Bu kategoriye bağlı içerik veya test bulunduğu için silinemez.",
      },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ message: "Kategori başarıyla silindi." });
}
