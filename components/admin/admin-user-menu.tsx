"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  ADMIN: "Süper Admin",
  EDITOR: "Editör",
  AUTHOR: "Yazar",
  MEMBER: "Üye",
};

type AdminUserMenuProps = {
  variant?: "header" | "sidebar";
  onAction?: () => void;
};

export function AdminUserMenu({
  variant = "header",
  onAction,
}: AdminUserMenuProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/giris");
      router.refresh();
    } catch {
      setLoggingOut(false);
    } finally {
      onAction?.();
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          variant === "header" ? "size-10" : "py-4"
        )}
      >
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" className="rounded-xl" asChild>
        <Link href="/giris">Giriş Yap</Link>
      </Button>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5">
          <div className="relative size-7 shrink-0 overflow-hidden rounded-md bg-white/10">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
                sizes="28px"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-slate-400">
                <User className="size-3.5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium leading-tight text-white">
              {user.name}
            </p>
            <p className="truncate text-[10px] leading-tight text-slate-400">
              {roleLabels[user.role] ?? user.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/"
            onClick={onAction}
            className="flex items-center justify-center gap-1 rounded-md border border-white/10 px-2 py-1.5 text-[10px] font-medium leading-tight text-slate-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="size-3 shrink-0" />
            Siteye Dön
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-[10px] font-medium leading-tight text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <LogOut className="size-3" />
            )}
            Çıkış
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3">
        <div className="relative size-8 overflow-hidden rounded-lg bg-slate-100">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-400">
              <User className="size-4" />
            </div>
          )}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-brand-navy">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {roleLabels[user.role] ?? user.role}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="hidden rounded-xl sm:inline-flex"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        Çıkış
      </Button>

      <Button
        variant="outline"
        size="icon-sm"
        className="rounded-xl sm:hidden"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-label="Çıkış yap"
      >
        {loggingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
      </Button>
    </div>
  );
}
