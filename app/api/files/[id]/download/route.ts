import { NextResponse } from "next/server";

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

  const targetUrl = file.fileUrl.startsWith("http")
    ? file.fileUrl
    : new URL(file.fileUrl, request.url).toString();

  return NextResponse.redirect(targetUrl);
}
