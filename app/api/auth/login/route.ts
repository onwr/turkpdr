import { NextResponse } from "next/server";

import { sanitizeUser, setAuthCookie, signToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

function validateLogin(body: LoginBody): string | null {
  if (!body.email?.trim()) {
    return "E-posta alanı zorunludur.";
  }
  if (!body.password) {
    return "Şifre alanı zorunludur.";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const validationError = validateLogin(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const email = body.email!.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(body.password!, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: "Giriş başarılı.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Giriş sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
