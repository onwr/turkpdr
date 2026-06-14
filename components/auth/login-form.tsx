"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";

import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REMEMBER_EMAIL_KEY = "turkpdr_remember_email";

const errorMessages: Record<string, string> = {
  oturum: "Bu sayfaya erişmek için giriş yapmalısınız.",
  yetkisiz: "Admin paneline erişim yetkiniz bulunmuyor.",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const errorParam = searchParams.get("error");
  const successParam = searchParams.get("success");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(
    errorParam ? (errorMessages[errorParam] ?? "Bir hata oluştu.") : null
  );
  const [success, setSuccess] = useState<string | null>(
    successParam === "kayit" ? "Kayıt başarılı. Giriş yapabilirsiniz." : null
  );
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = "E-posta adresi gereklidir.";
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = "Geçerli bir e-posta adresi girin.";
    }

    if (!password) {
      nextErrors.password = "Şifre gereklidir.";
    } 

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Giriş başarısız.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      const role = data.user?.role;
      const redirectUrl =
        role === "ADMIN" || role === "EDITOR"
          ? callbackUrl.startsWith("/admin")
            ? callbackUrl
            : "/admin"
          : callbackUrl === "/admin"
            ? "/"
            : callbackUrl;

      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[520px] rounded-3xl border-slate-200 bg-white px-1 py-2 shadow-2xl shadow-slate-200/60 dark:border-border dark:bg-card dark:shadow-none">
      <CardHeader className="space-y-2 px-8 pt-8 pb-0 sm:px-10 sm:pt-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-foreground">
          Hesabınıza Giriş Yapın
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-muted-foreground">
          TürkPDR hesabınıza giriş yaparak içeriklerinize ve topluluğa erişin.
        </p>
      </CardHeader>

      <CardContent className="px-8 pb-8 sm:px-10 sm:pb-10">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-slate-700 dark:text-foreground">
              E-posta
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="ornek@email.com"
              className="h-11 rounded-xl"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm text-slate-700 dark:text-foreground"
            >
              Şifre
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="••••••••"
              inputClassName="h-11"
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-normal text-slate-600 dark:text-muted-foreground"
              >
                Beni hatırla
              </Label>
            </div>
            <Link
              href="/iletisim"
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-xl bg-brand-blue text-base hover:bg-brand-blue/90"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Giriş Yap
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link
            href="/kayit"
            className="font-semibold text-brand-blue hover:underline"
          >
            Üye olun
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
