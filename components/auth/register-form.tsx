"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: typeof fieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Ad soyad gereklidir.";
    } else if (name.trim().length < 2) {
      nextErrors.name = "Ad soyad en az 2 karakter olmalıdır.";
    }

    if (!email.trim()) {
      nextErrors.email = "E-posta adresi gereklidir.";
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = "Geçerli bir e-posta adresi girin.";
    }

    if (!password) {
      nextErrors.password = "Şifre gereklidir.";
    } 

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Şifre tekrarı gereklidir.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Şifreler eşleşmiyor.";
    }

    if (!acceptedTerms) {
      nextErrors.terms = "Devam etmek için kullanım şartlarını kabul etmelisiniz.";
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız.");
        return;
      }

      setSuccess(data.message ?? "Kayıt başarılı.");
      setTimeout(() => {
        router.push("/giris?success=kayit");
      }, 1200);
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
          Ücretsiz Üye Olun
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-muted-foreground">
          TürkPDR topluluğuna katılın ve psikoloji içeriklerine erişin.
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
            <Label htmlFor="name" className="text-sm text-slate-700 dark:text-foreground">
              Ad Soyad
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Adınız Soyadınız"
              className="h-11 rounded-xl"
              autoComplete="name"
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            )}
          </div>

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
              placeholder="Şifrenizi girin"
              inputClassName="h-11"
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm text-slate-700 dark:text-foreground"
            >
              Şifre Tekrar
            </Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }
              }}
              placeholder="Şifrenizi tekrar girin"
              inputClassName="h-11"
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirmPassword}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptedTerms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => {
                  setAcceptedTerms(checked === true);
                  if (fieldErrors.terms) {
                    setFieldErrors((prev) => ({ ...prev, terms: undefined }));
                  }
                }}
                className="mt-0.5"
              />
              <Label
                htmlFor="acceptedTerms"
                className="cursor-pointer text-sm leading-relaxed font-normal text-slate-600 dark:text-muted-foreground"
              >
                <Link
                  href="/kvkk"
                  className="font-medium text-brand-blue hover:underline"
                  target="_blank"
                >
                  Kullanım şartlarını
                </Link>{" "}
                kabul ediyorum
              </Label>
            </div>
            {fieldErrors.terms && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.terms}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-xl bg-brand-blue text-base hover:bg-brand-blue/90"
            disabled={loading || !acceptedTerms}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Üye Ol
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link
            href="/giris"
            className="font-semibold text-brand-blue hover:underline"
          >
            Giriş yapın
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
