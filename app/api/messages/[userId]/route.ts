import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getChatMessages } from "@/lib/queries/messages";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { userId: partnerId } = await context.params;

  if (partnerId === auth.user.id) {
    return NextResponse.json(
      { error: "Kendinizle mesajlaşma görüntülenemez." },
      { status: 400 }
    );
  }

  try {
    const { messages, partner, isArchived } = await getChatMessages(
      auth.user.id,
      partnerId
    );

    if (!partner) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ messages, partner, isArchived });
  } catch {
    return NextResponse.json(
      { error: "Mesajlar yüklenemedi." },
      { status: 500 }
    );
  }
}
