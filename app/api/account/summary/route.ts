import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getAccountSummary } from "@/lib/queries/account";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const summary = await getAccountSummary(auth.user.id);
  return NextResponse.json({ summary });
}
