import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  getAdminAnalyticsData,
  parseAnalyticsRange,
} from "@/lib/queries/admin-analytics";

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const range = parseAnalyticsRange(searchParams.get("range"));

  try {
    const data = await getAdminAnalyticsData(range);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Analitik verileri yüklenemedi." },
      { status: 500 }
    );
  }
}
