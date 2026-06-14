import { redirect } from "next/navigation";

import { getCurrentUser, type AuthUser } from "@/lib/auth";

export async function requireAccountUser(
  callbackPath = "/hesabim"
): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/giris?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return user;
}
