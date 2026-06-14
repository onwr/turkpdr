"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Calendar, Palette, Search, User } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ArticleCategory } from "@/types/article";
import type { Article } from "@/types/home";
import { cn } from "@/lib/utils";

type PsikoSanatListPageProps = {
  title: string;
  description: string;
  items: Article[];
  categories: ArticleCategory[];
  initialSearch?: string;
  initialCategory?: string;
  emptyTitle: string;
  emptyDescription: string;
};

function PsikoSanatCard({ item }: { item: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm shadow-brand-navy/5 transition-all hover:-translate-y-1 hover:border-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/10">
      <Link
        href={`/psiko-sanat/${item.slug}`}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <Image
          src={item.coverImage}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={item.coverImage.startsWith("/uploads/")}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <span className="w-fit rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
          {item.category}
        </span>

        <h2 className="text-lg font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
          <Link href={`/psiko-sanat/${item.slug}`}>{item.title}</Link>
        </h2>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.excerpt}
        </p>

        <div className="flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="size-3.5" />
            {item.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {item.date}
          </span>
        </div>
      </div>
    </article>
  );
}

export function PsikoSanatListPage({
  title,
  description,
  items,
  categories,
  initialSearch = "",
  initialCategory = "",
  emptyTitle,
  emptyDescription,
}: PsikoSanatListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const activeCategoryLabel = useMemo(() => {
    return categories.find((c) => c.slug === category)?.label;
  }, [categories, category]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("q", search.trim());
    } else {
      params.delete("q");
    }
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/psiko-sanat?${params.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyFilters();
  };

  return (
    <main className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-brand-blue">
              <Palette className="size-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Psiko Sanat
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Kitap, film veya içerik ara..."
                className="rounded-xl pl-9"
              />
            </div>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sm:w-52"
              aria-label="Kategori filtresi"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                  {cat.count > 0 ? ` (${cat.count})` : ""}
                </option>
              ))}
            </Select>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-blue/20 transition-colors hover:bg-brand-blue/90"
            >
              Filtrele
            </button>
          </div>

          {activeCategoryLabel && (
            <p className="mb-6 text-sm text-muted-foreground">
              Filtre:{" "}
              <span className="font-medium text-brand-navy">
                {activeCategoryLabel}
              </span>
            </p>
          )}

          {categories.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory("");
                  router.push("/psiko-sanat");
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  !category
                    ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                    : "border-slate-200 text-muted-foreground hover:border-brand-blue/30"
                )}
              >
                Tümü
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setCategory(cat.slug);
                    router.push(`/psiko-sanat?category=${cat.slug}`);
                  }}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    category === cat.slug
                      ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                      : "border-slate-200 text-muted-foreground hover:border-brand-blue/30"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <PsikoSanatCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
  );
}
