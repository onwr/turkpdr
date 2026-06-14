import type { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_ROLES, TOKEN_COOKIE } from "@/lib/auth/constants";
import type { AuthUser, JwtPayload } from "@/lib/auth/types";
import { prisma } from "@/lib/prisma";

export type { AuthUser, JwtPayload } from "@/lib/auth/types";
export { TOKEN_COOKIE, canAccessAdmin } from "@/lib/auth/constants";
const JWT_EXPIRES_IN = "7d";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const ADMIN_ROLE_LIST: UserRole[] = [...ADMIN_ROLES];

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET ortam değişkeni tanımlı değil.");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!decoded?.sub || !decoded?.email || !decoded?.role) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  title: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    title: user.title,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      title: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return sanitizeUser(user);
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/giris?error=oturum");
  }
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect("/giris?error=yetkisiz");
  }
  return user;
}

export async function requireAdminAccess(): Promise<AuthUser> {
  return requireRole(ADMIN_ROLE_LIST);
}

export function getTokenFromRequest(
  cookieHeader: string | null
): string | undefined {
  if (!cookieHeader) return undefined;

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${TOKEN_COOKIE}=`));

  return match?.split("=")[1];
}
