import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import { createMediaAsset } from "@/lib/media/utils";
import { getUploadCategory, saveUploadedFile } from "@/lib/upload";
import type { AllowedMimeType } from "@/types/upload";

export async function POST(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) {
    const status = auth.error.status;
    const body = await auth.error.json();
    return NextResponse.json(
      { success: false, message: body.error ?? "Yetkisiz erişim." },
      { status }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Dosya bulunamadı." },
      { status: 400 }
    );
  }

  try {
    const result = await saveUploadedFile(file);
    const category = getUploadCategory(file.type as AllowedMimeType);
    if (category) {
      await createMediaAsset({
        fileName: result.fileName,
        fileUrl: result.url,
        fileType: result.fileType,
        fileSize: result.size,
        category,
        uploadedById: auth.user.id,
        title: file.name.replace(/\.[^.]+$/, ""),
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dosya yüklenemedi.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
