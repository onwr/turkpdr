import Link from "next/link";
import { Bookmark, ClipboardList, FileText, Newspaper, PenLine } from "lucide-react";

import type { ProfileFavorite } from "@/types/profile";
import { cn } from "@/lib/utils";

const typeConfig = {
  makale: { icon: PenLine, href: "makaleler", color: "bg-indigo-50 text-indigo-600" },
  haber: { icon: Newspaper, href: "haberler", color: "bg-sky-50 text-sky-600" },
  dosya: { icon: FileText, href: "dosyalar", color: "bg-amber-50 text-amber-600" },
  test: { icon: ClipboardList, href: "test-merkezi", color: "bg-emerald-50 text-emerald-600" },
} as const;

type ProfileFavoritesProps = {
  favorites: ProfileFavorite[];
};

export function ProfileFavorites({ favorites }: ProfileFavoritesProps) {
  if (favorites.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">
        Henüz favori eklenmemiş.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {favorites.map((item) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;

        return (
          <li key={item.id}>
            <Link
              href={`/${config.href}/${item.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 transition-all hover:border-brand-blue/20 hover:shadow-md"
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  config.color
                )}
              >
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-brand-navy transition-colors group-hover:text-brand-blue">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                  {item.type} · {item.savedAt}
                </p>
              </div>

              <Bookmark className="size-4 shrink-0 text-brand-blue" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
