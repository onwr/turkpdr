import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import {
  getActivityFilterOptions,
  getActivityLogs,
  parseActivityDate,
  parseActivityEndDate,
} from "@/lib/queries/activity-log";

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams, 20);
  const userId = searchParams.get("userId")?.trim() || undefined;
  const action = searchParams.get("action")?.trim() || undefined;
  const entityType = searchParams.get("entityType")?.trim() || undefined;
  const search = searchParams.get("search")?.trim() || undefined;
  const dateFrom = parseActivityDate(searchParams.get("dateFrom"));
  const dateTo = parseActivityEndDate(searchParams.get("dateTo"));

  try {
    const { activities, total } = await getActivityLogs({
      userId,
      action,
      entityType,
      search,
      dateFrom,
      dateTo,
      page,
      limit,
      skip,
    });

    const meta = buildPaginationMeta(total, page, limit);
    const filters = getActivityFilterOptions();

    return NextResponse.json({
      activities,
      filters,
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Aktivite geçmişi yüklenemedi." },
      { status: 500 }
    );
  }
}
