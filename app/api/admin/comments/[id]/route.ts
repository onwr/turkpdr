import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const existing = await prisma.comment.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });
  }

  try {
    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ message: "Yorum başarıyla silindi." });
  } catch {
    return NextResponse.json(
      { error: "Yorum silinemedi. İlişkili kayıtlar olabilir." },
      { status: 500 }
    );
  }
}
