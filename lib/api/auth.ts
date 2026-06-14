import { NextResponse } from "next/server";

import { getCurrentUser, type AuthUser } from "@/lib/auth";

type AuthResult =
  | { user: AuthUser; error?: never }
  | { user?: never; error: NextResponse };

export async function requireAuth(): Promise<AuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekiyor." },
        { status: 401 }
      ),
    };
  }

  return { user };
}
