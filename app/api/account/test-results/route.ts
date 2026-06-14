import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getAccountTestResults } from "@/lib/queries/account";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const results = await getAccountTestResults(auth.user.id);
  return NextResponse.json({ results });
}
