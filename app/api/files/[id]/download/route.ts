import { NextResponse } from "next/server";

import { normalizeMediaUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";
import { getPublicFileWhere } from "@/lib/queries/constants";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const file = await prisma.fileAsset.findFirst({
    where: { id, ...getPublicFileWhere() },
    select: { id: true, fileUrl: true, title: true },
  });

  if (!file) {
    return NextResponse.json(
      { error: "Dosya bulunamadı veya yayında değil." },
      { status: 404 }
    );
  }

  await prisma.fileAsset.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  const normalizedPath = normalizeMediaUrl(file.fileUrl);
  if (!normalizedPath) {
    return NextResponse.json({ error: "Dosya URL'si geçersiz." }, { status: 404 });
  }

  return NextResponse.redirect(new URL(normalizedPath, request.url));
}
