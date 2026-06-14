"use client";

import { Menu, Search } from "lucide-react";

import { NotificationBell } from "@/components/admin/notifications/notification-bell";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-brand-navy sm:text-xl">
            Yönetim Paneli
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            TürkPDR içerik ve üye yönetimi
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="İçerik, üye veya yazar ara..."
            className="h-10 w-48 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 lg:w-64"
            aria-label="Arama"
          />
        </div>

        <NotificationBell />

        <AdminUserMenu variant="header" />
      </div>
    </header>
  );
}
