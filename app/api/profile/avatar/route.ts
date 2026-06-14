import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";
import { IMAGE_ACCEPT } from "@/types/upload";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Giriş yapmanız gerekiyor." },
      { status: 401 }
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

  const allowedTypes = IMAGE_ACCEPT.split(",");
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: "Yalnızca JPG, PNG veya WEBP formatları desteklenir.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await saveUploadedFile(file);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profil fotoğrafı yüklenemedi.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
