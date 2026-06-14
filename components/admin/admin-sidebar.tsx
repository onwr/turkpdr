"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  FolderOpen,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Palette,
  PenLine,
  Settings,
  Tags,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";

import { useAdminBranding } from "@/components/admin/admin-branding-provider";
import { SiteBrand } from "@/components/shared/site-brand";
import { adminNavItems, getAdminActiveHref } from "@/lib/admin/nav";
import type { AdminNavItem } from "@/types/admin";
import { cn } from "@/lib/utils";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";

const iconMap = {
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  activity: History,
  content: FolderOpen,
  categories: Tags,
  news: Newspaper,
  articles: FileText,
  files: FolderOpen,
  media: ImageIcon,
  videos: Video,
  tests: ClipboardList,
  dictionary: BookOpen,
  psikoSanat: Palette,
  trash: Trash2,
  authors: PenLine,
  members: Users,
  comments: MessageSquare,
  settings: Settings,
} as const;

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: AdminNavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium leading-tight transition-colors",
        isActive
          ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/25"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {item.label}
    </Link>
  );
}

function AdminSidebarNav({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeHref = getAdminActiveHref(pathname, searchParams.toString());

  return (
    <nav className="scrollbar-thin min-h-0 space-y-px overflow-y-auto px-2.5 py-2">
      {adminNavItems.map((item) => (
        <NavLink
          key={`${item.label}-${item.icon}`}
          item={item}
          isActive={activeHref === item.href}
          onNavigate={onClose}
        />
      ))}
    </nav>
  );
}

function SidebarNavFallback() {
  return (
    <nav className="scrollbar-thin min-h-0 space-y-px overflow-y-auto px-2.5 py-2">
      {adminNavItems.map((item) => (
        <div
          key={`${item.label}-${item.icon}`}
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium leading-tight text-slate-300"
        >
          <span className="size-4 shrink-0" />
          {item.label}
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const branding = useAdminBranding();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-brand-navy/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 grid h-dvh w-64 grid-rows-[auto_minmax(0,1fr)_auto] bg-brand-navy transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Admin sidebar"
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-3">
          <Link
            href="/admin"
            className="flex min-w-0 items-center transition-opacity hover:opacity-90"
            aria-label={`${branding.siteName} Yönetim Paneli`}
          >
            <SiteBrand
              siteName={branding.siteName}
              logoUrl={branding.logoUrl}
              variant="dark"
              className="max-h-8"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Sidebar'ı kapat"
          >
            <X className="size-5" />
          </button>
        </div>

        <Suspense fallback={<SidebarNavFallback />}>
          <AdminSidebarNav onClose={onClose} />
        </Suspense>

        <div className="shrink-0 border-t border-white/10 p-2.5">
          <AdminUserMenu variant="sidebar" onAction={onClose} />
        </div>
      </aside>
    </>
  );
}
