import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const favorite = await prisma.favorite.findFirst({
    where: { id, userId: auth.user.id },
    select: { id: true },
  });

  if (!favorite) {
    return NextResponse.json(
      { error: "Favori bulunamadı." },
      { status: 404 }
    );
  }

  await prisma.favorite.delete({ where: { id: favorite.id } });

  return NextResponse.json({
    message: "Favorilerden kaldırıldı.",
  });
}
