import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { notifyPendingFile } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getAccountFiles } from "@/lib/queries/account";
import { saveUploadedFile } from "@/lib/upload";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const files = await getAccountFiles(auth.user.id);
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("file");

  if (!title) {
    return NextResponse.json(
      { error: "Dosya başlığı zorunludur." },
      { status: 400 }
    );
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Dosya seçilmedi." },
      { status: 400 }
    );
  }

  try {
    const upload = await saveUploadedFile(file);

    const asset = await prisma.fileAsset.create({
      data: {
        title,
        description: description || null,
        fileUrl: upload.url,
        fileType: upload.fileType,
        fileSize: upload.size,
        status: "PENDING",
        uploadedById: auth.user.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    void notifyPendingFile({
      title: asset.title,
      fileId: asset.id,
    });

    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.FILE_UPLOADED,
      entityType: ACTIVITY_ENTITY_TYPES.FILE,
      entityId: asset.id,
      description: `"${asset.title}" dosyası yüklendi`,
      metadata: { source: "account" },
    });

    return NextResponse.json(
      {
        message: "Dosyanız onay için gönderildi.",
        file: asset,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dosya yüklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
