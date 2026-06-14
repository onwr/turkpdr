import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getTotalUnreadCount } from "@/lib/queries/messages";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const count = await getTotalUnreadCount(auth.user.id);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json(
      { error: "Okunmamış mesaj sayısı alınamadı." },
      { status: 500 }
    );
  }
}
