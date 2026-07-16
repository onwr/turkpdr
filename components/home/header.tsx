"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  HeaderSearch,
  HeaderSearchLink,
} from "@/components/search/header-search";
import { HeaderAuthActions } from "@/components/home/header-auth";
import { SiteBrand, type SiteBranding } from "@/components/shared/site-brand";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/mock-data/home";
import type { AuthUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

export type HeaderBranding = SiteBranding;

const navLinkClass =
  "whitespace-nowrap rounded-xl font-medium text-brand-navy/80 transition-colors hover:bg-brand-blue/5 hover:text-brand-blue dark:text-muted-foreground dark:hover:bg-brand-blue/10 dark:hover:text-brand-blue";

function NavLinks({
  linkClassName,
  onNavigate,
}: {
  linkClassName?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(navLinkClass, linkClassName)}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

type HeaderProps = {
  branding?: HeaderBranding;
  user?: AuthUser | null;
};

export function Header({ branding, user = null }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const siteName = branding?.siteName ?? "TürkPDR";
  const logoUrl = branding?.logoUrl || "/logo.png";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-xl print:hidden dark:bg-background/80">
      <div className="mx-auto max-w-[1700px] px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
            aria-label={`${siteName} Ana Sayfa`}
          >
            <SiteBrand siteName={siteName} logoUrl={logoUrl} />
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <HeaderSearchLink className="md:hidden" />

            <HeaderSearch
              className="hidden w-40 md:block lg:w-44 xl:w-52 2xl:w-64"
              inputClassName="h-9 text-sm"
              placeholder="Ara..."
            />

            <HeaderAuthActions user={user} layout="desktop" />

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>

        <nav
          className="hidden flex-wrap items-center justify-center gap-x-0.5 gap-y-1 border-t border-border/40 py-2.5 scrollbar-none lg:flex xl:gap-x-1 2xl:gap-x-1.5 2xl:py-3"
          aria-label="Ana navigasyon"
        >
          <NavLinks linkClassName="shrink-0 px-2.5 py-1.5 text-sm font-medium xl:px-3" />
        </nav>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-white px-4 py-4 lg:hidden dark:bg-background">
          <HeaderSearch
            className="mb-4"
            inputClassName="h-10"
            placeholder="Ara..."
            onNavigate={() => setMobileOpen(false)}
          />
          <nav className="flex flex-col gap-1" aria-label="Mobil navigasyon">
            <NavLinks
              linkClassName="px-3 py-2.5 text-sm"
              onNavigate={() => setMobileOpen(false)}
            />
          </nav>
          <div className="mt-4 border-t border-border/60 pt-4">
            <HeaderAuthActions
              user={user}
              layout="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
