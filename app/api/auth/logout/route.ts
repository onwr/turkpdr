import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json({
      message: "Çıkış başarılı.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Çıkış sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
