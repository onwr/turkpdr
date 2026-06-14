import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { markConversationRead } from "@/lib/queries/messages";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ userId: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { userId: partnerId } = await context.params;

  if (partnerId === auth.user.id) {
    return NextResponse.json(
      { error: "Geçersiz işlem." },
      { status: 400 }
    );
  }

  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true },
  });

  if (!partner) {
    return NextResponse.json(
      { error: "Kullanıcı bulunamadı." },
      { status: 404 }
    );
  }

  try {
    const result = await markConversationRead(auth.user.id, partnerId);

    return NextResponse.json({
      message: "Mesajlar okundu olarak işaretlendi.",
      updatedCount: result.count,
    });
  } catch {
    return NextResponse.json(
      { error: "Mesajlar güncellenemedi." },
      { status: 500 }
    );
  }
}
