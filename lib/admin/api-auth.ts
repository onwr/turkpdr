import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, type AuthUser } from "@/lib/auth";

const CONTENT_MANAGER_ROLES: UserRole[] = ["ADMIN", "EDITOR"];

export function canManageContent(role: UserRole): boolean {
  return CONTENT_MANAGER_ROLES.includes(role);
}

export function canDeleteContent(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canPublishContent(role: UserRole): boolean {
  return CONTENT_MANAGER_ROLES.includes(role);
}

export function canRestoreFromTrash(role: UserRole): boolean {
  return CONTENT_MANAGER_ROLES.includes(role);
}

export function canPermanentlyDelete(role: UserRole): boolean {
  return role === "ADMIN";
}

type AuthResult =
  | { user: AuthUser; error?: never }
  | { user?: never; error: NextResponse };

export async function requireContentManager(): Promise<AuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      ),
    };
  }

  if (!canManageContent(user.role)) {
    return {
      error: NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function requireAdmin(): Promise<AuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Bu işlem yalnızca yöneticilere aittir." },
        { status: 403 }
      ),
    };
  }

  return { user };
}
