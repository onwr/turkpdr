import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import {
  isTrashEntity,
  listTrashedItems,
} from "@/lib/trash/utils";

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity") ?? "contents";

  if (!isTrashEntity(entity)) {
    return NextResponse.json(
      { error: "Geçersiz çöp kutusu sekmesi." },
      { status: 400 }
    );
  }

  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();

  try {
    const { items, total } = await listTrashedItems(entity, {
      skip,
      limit,
      search,
    });

    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      entity,
      items,
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Çöp kutusu yüklenemedi." },
      { status: 500 }
    );
  }
}
