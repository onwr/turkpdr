import Link from "next/link";
import { Bookmark } from "lucide-react";

import type { AccountFavoriteItem } from "@/types/account";

type AccountFavoritesListProps = {
  items: AccountFavoriteItem[];
  emptyMessage?: string;
};

export function AccountFavoritesList({
  items,
  emptyMessage = "Henüz favori eklenmemiş.",
}: AccountFavoritesListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 transition-colors hover:border-brand-blue/20"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <Bookmark className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={item.href}
              className="font-medium text-brand-navy hover:text-brand-blue"
            >
              {item.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.typeLabel}
              {item.category ? ` · ${item.category}` : ""} · {item.savedAt}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
