import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { unarchiveConversation } from "@/lib/queries/messages";
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

  const hasConversation = await prisma.message.findFirst({
    where: {
      OR: [
        { senderId: auth.user.id, receiverId: partnerId },
        { senderId: partnerId, receiverId: auth.user.id },
      ],
    },
    select: { id: true },
  });

  if (!hasConversation) {
    return NextResponse.json(
      { error: "Konuşma bulunamadı." },
      { status: 404 }
    );
  }

  try {
    await unarchiveConversation(auth.user.id, partnerId);
    return NextResponse.json({ message: "Konuşma arşivden çıkarıldı." });
  } catch {
    return NextResponse.json(
      { error: "Konuşma arşivden çıkarılamadı." },
      { status: 500 }
    );
  }
}
