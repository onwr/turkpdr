import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import {
  buildMediaTypeWhere,
  mediaInclude,
  serializeMediaAsset,
} from "@/lib/media/utils";
import { prisma } from "@/lib/prisma";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const type = searchParams.get("type");

  const where: Prisma.MediaAssetWhereInput = {
    ...NOT_DELETED_WHERE,
  };
  const typeWhere = buildMediaTypeWhere(type);
  if (typeWhere) {
    Object.assign(where, typeWhere);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { fileName: { contains: search, mode: "insensitive" } },
      { fileUrl: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [items, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: mediaInclude,
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      media: items.map(serializeMediaAsset),
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Medya kütüphanesi yüklenemedi." },
      { status: 500 }
    );
  }
}
