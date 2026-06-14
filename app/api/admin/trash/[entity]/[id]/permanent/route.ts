import { NextResponse } from "next/server";

import {
  canPermanentlyDelete,
  requireContentManager,
} from "@/lib/admin/api-auth";
import {
  isTrashEntity,
  permanentlyDeleteEntity,
  TrashEntityError,
} from "@/lib/trash/utils";

type RouteContext = { params: Promise<{ entity: string; id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  if (!canPermanentlyDelete(auth.user.role)) {
    return NextResponse.json(
      { error: "Kalıcı silme yalnızca yöneticilere aittir." },
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
    const result = await permanentlyDeleteEntity(entity, id, auth.user.id);

    return NextResponse.json({
      message: `"${result.title}" kalıcı olarak silindi.`,
    });
  } catch (error) {
    if (error instanceof TrashEntityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Kalıcı silme başarısız." },
      { status: 500 }
    );
  }
}
