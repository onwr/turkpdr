"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ACCOUNT_NAV } from "@/lib/account/navigation";
import { cn } from "@/lib/utils";

function getActiveHref(pathname: string): string | null {
  const matches = ACCOUNT_NAV.filter((item) => {
    const exact = "exact" in item ? item.exact : false;
    if (exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  if (matches.length === 0) return null;

  return matches.sort((a, b) => b.href.length - a.href.length)[0].href;
}

export function AccountSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeHref = getActiveHref(pathname);

  const navContent = (
    <nav className="space-y-1" aria-label="Hesap menüsü">
      {ACCOUNT_NAV.map((item) => {
        const Icon = item.icon;
        const active = activeHref === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-brand-navy shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Menu className="size-4 text-brand-blue" />
            Hesap Menüsü
          </span>
          {mobileOpen ? <X className="size-4" /> : null}
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {navContent}
          </div>
        )}
      </div>

      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hesabım
          </p>
          {navContent}
        </div>
      </aside>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {ACCOUNT_NAV.map((item) => {
          const active = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-brand-blue text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
