import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { SearchResultItem } from "@/types/search";

type SearchResultCardProps = {
  item: SearchResultItem;
};

export function SearchResultCard({ item }: SearchResultCardProps) {
  const isExternalDownload = item.url.startsWith("/api/files/");

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-blue/20 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge variant="secondary" className="shrink-0">
          {item.typeLabel}
        </Badge>
      </div>

      <h3 className="text-base font-semibold text-brand-navy transition-colors group-hover:text-brand-blue">
        {isExternalDownload ? (
          <a href={item.url}>{item.title}</a>
        ) : (
          <Link href={item.url}>{item.title}</Link>
        )}
      </h3>

      {item.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}

      <div className="mt-4">
        {isExternalDownload ? (
          <a
            href={item.url}
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            İndir →
          </a>
        ) : (
          <Link
            href={item.url}
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            Görüntüle →
          </Link>
        )}
      </div>
    </article>
  );
}

type SearchResultGroupProps = {
  title: string;
  items: SearchResultItem[];
};

export function SearchResultGroup({ title, items }: SearchResultGroupProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <SearchResultCard key={`${title}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
