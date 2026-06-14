import { NextResponse } from "next/server";

import { requireAdmin, requireContentManager } from "@/lib/admin/api-auth";
import {
  findMediaUsages,
  mediaInclude,
  serializeMediaAsset,
} from "@/lib/media/utils";
import { prisma } from "@/lib/prisma";
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

  try {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id, ...NOT_DELETED_WHERE },
      include: mediaInclude,
    });

    if (!asset) {
      return NextResponse.json({ error: "Medya bulunamadı." }, { status: 404 });
    }

    const usages = await findMediaUsages(asset.fileUrl);

    return NextResponse.json({
      media: {
        ...serializeMediaAsset(asset),
        usages,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Medya detayı yüklenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const result = await softDeleteEntity("media", id, auth.user.id);

    return NextResponse.json({
      message: `"${result.title}" çöp kutusuna taşındı.`,
    });
  } catch (error) {
    if (error instanceof TrashEntityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Medya silinemedi." }, { status: 500 });
  }
}
