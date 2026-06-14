import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getAccountFavorites } from "@/lib/queries/account";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const favorites = await getAccountFavorites(auth.user.id);
  return NextResponse.json({ favorites });
}
