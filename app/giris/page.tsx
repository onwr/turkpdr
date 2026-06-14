import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Giriş Yap | TürkPDR",
  description: "TürkPDR hesabınıza giriş yapın.",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="h-[520px] w-full max-w-[520px] animate-pulse rounded-3xl bg-slate-100 dark:bg-muted" />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
