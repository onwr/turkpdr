import { NextResponse } from "next/server";

import { canRestoreFromTrash, requireContentManager } from "@/lib/admin/api-auth";
import {
  isTrashEntity,
  restoreEntity,
  TrashEntityError,
} from "@/lib/trash/utils";

type RouteContext = { params: Promise<{ entity: string; id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  if (!canRestoreFromTrash(auth.user.role)) {
    return NextResponse.json(
      { error: "Geri yükleme yetkisi bulunmuyor." },
      { status: 403 }
    );
  }

  const { entity, id } = await context.params;

  if (!isTrashEntity(entity)) {
    return NextResponse.json(
      { error: "Geçersiz varlık türü." },
      { status: 400 }
    );
  }

  try {
    const result = await restoreEntity(entity, id, auth.user.id);

    return NextResponse.json({
      message: `"${result.title}" geri yüklendi.`,
    });
  } catch (error) {
    if (error instanceof TrashEntityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Geri yükleme başarısız." },
      { status: 500 }
    );
  }
}
