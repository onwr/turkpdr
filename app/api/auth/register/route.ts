import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { hashPassword } from "@/lib/password";
import { notifyNewUser } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

function validateRegister(body: RegisterBody): string | null {
  if (!body.name?.trim()) {
    return "Ad soyad alanı zorunludur.";
  }
  if (body.name.trim().length < 2) {
    return "Ad soyad en az 2 karakter olmalıdır.";
  }
  if (!body.email?.trim()) {
    return "E-posta alanı zorunludur.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email.trim())) {
    return "Geçerli bir e-posta adresi girin.";
  }
  if (!body.password) {
    return "Şifre alanı zorunludur.";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const validationError = validateRegister(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const name = body.name!.trim();
    const email = body.email!.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(body.password!);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.MEMBER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        title: true,
        createdAt: true,
      },
    });

    void notifyNewUser({
      userName: user.name,
      userId: user.id,
    });

    void logActivity({
      userId: user.id,
      action: ACTIVITY_ACTIONS.USER_REGISTERED,
      entityType: ACTIVITY_ENTITY_TYPES.USER,
      entityId: user.id,
      description: `${user.name} yeni üye olarak kayıt oldu`,
      metadata: { email: user.email },
    });

    return NextResponse.json(
      {
        message: "Kayıt başarılı. Giriş yapabilirsiniz.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
