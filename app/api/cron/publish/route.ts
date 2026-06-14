import { NextResponse } from "next/server";

import {
  publishDueScheduledItems,
} from "@/lib/scheduling/publish";
import { verifyCronSecret } from "@/lib/scheduling/utils";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const summary = await publishDueScheduledItems();

    return NextResponse.json({
      message: "Zamanlanmış yayınlar işlendi.",
      published: summary,
      processedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Zamanlanmış yayın işlemi başarısız." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
