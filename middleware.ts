import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

import { canAccessAdmin, TOKEN_COOKIE } from "@/lib/auth/constants";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET ortam değişkeni tanımlı değil.");
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const loginUrl = new URL("/giris", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);

  if (!token) {
    loginUrl.searchParams.set("error", "oturum");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const role = payload.role as string | undefined;

    if (!role || !canAccessAdmin(role)) {
      const unauthorizedUrl = new URL("/giris", request.url);
      unauthorizedUrl.searchParams.set("error", "yetkisiz");
      unauthorizedUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  } catch {
    const expiredUrl = new URL("/giris", request.url);
    expiredUrl.searchParams.set("error", "oturum");
    expiredUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(expiredUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
