"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Loader2, LogOut, User } from "lucide-react";

import { MessageUnreadBadge } from "@/components/messages/message-unread-badge";
import { AccountNotificationDropdown } from "@/components/account/account-notification-dropdown";
import { Button } from "@/components/ui/button";
import { canAccessAdmin } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/auth/types";

type HeaderAuthActionsProps = {
  user: AuthUser | null;
  layout?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function HeaderAuthActions({
  user,
  layout = "desktop",
  onNavigate,
}: HeaderAuthActionsProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onNavigate?.();
      router.push("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  if (!user) {
    if (layout === "mobile") {
      return (
        <div className="flex flex-col gap-2">
          <Button variant="outline" asChild>
            <Link href="/giris" onClick={onNavigate}>
              Giriş Yap
            </Link>
          </Button>
          <Button
            className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90"
            asChild
          >
            <Link href="/kayit" onClick={onNavigate}>
              Kayıt Ol
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="hidden items-center gap-1.5 sm:flex 2xl:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="px-2.5 text-sm 2xl:px-3"
          asChild
        >
          <Link href="/giris">Giriş Yap</Link>
        </Button>
        <Button
          size="sm"
          className="rounded-xl bg-brand-blue px-2.5 text-sm text-white shadow-md shadow-brand-blue/25 hover:bg-brand-blue/90 2xl:px-4"
          asChild
        >
          <Link href="/kayit">Kayıt Ol</Link>
        </Button>
      </div>
    );
  }

  if (layout === "mobile") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AccountNotificationDropdown layout="mobile" onNavigate={onNavigate} />
          <MessageUnreadBadge layout="mobile" onNavigate={onNavigate} />
          <span className="text-sm font-medium text-brand-navy">Mesajlar</span>
        </div>

        <Link
          href="/hesabim"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-3"
        >
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-slate-400">
                <User className="size-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-brand-navy">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </Link>

        {canAccessAdmin(user.role) && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/admin" onClick={onNavigate}>
              <LayoutDashboard className="size-4" />
              Yönetim Paneli
            </Link>
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Çıkış Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-1.5 sm:flex 2xl:gap-2">
      <AccountNotificationDropdown layout="desktop" />
      <MessageUnreadBadge layout="desktop" />

      {canAccessAdmin(user.role) && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden px-2.5 text-sm md:inline-flex 2xl:px-3"
          asChild
        >
          <Link href="/admin">
            <LayoutDashboard className="size-4" />
            Admin
          </Link>
        </Button>
      )}

      <Link
        href="/hesabim"
        className="flex items-center gap-2 rounded-xl border border-border/60 py-1 pl-1 pr-2.5 transition-colors hover:bg-brand-blue/5"
      >
        <div className="relative size-8 overflow-hidden rounded-full bg-slate-100">
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
        <span className="max-w-[120px] truncate text-sm font-medium text-brand-navy lg:max-w-[160px]">
          {user.name}
        </span>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        className="px-2.5 text-sm 2xl:px-3"
        onClick={() => void handleLogout()}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        <span className="hidden lg:inline">Çıkış</span>
      </Button>
    </div>
  );
}
