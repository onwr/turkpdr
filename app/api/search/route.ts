import { NextResponse } from "next/server";

import { emptySearchResponse, searchSite } from "@/lib/queries/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(emptySearchResponse());
  }

  try {
    const results = await searchSite(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Arama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
