"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, Eye, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PublicDictionaryTerm } from "@/types/dictionary";
import { cn } from "@/lib/utils";

type LetterGroup = {
  letter: string;
  terms: PublicDictionaryTerm[];
};

type DictionaryPageProps = {
  groups: LetterGroup[];
  categories: string[];
  initialSearch?: string;
  initialCategory?: string;
};

function DictionaryTermCard({ term }: { term: PublicDictionaryTerm }) {
  return (
    <Link
      href={`/sozluk/${term.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
          <BookOpen className="size-5" />
        </div>
        {term.category && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {term.category}
          </span>
        )}
      </div>
      <h2 className="text-lg font-semibold text-brand-navy transition-colors group-hover:text-brand-blue">
        {term.title}
      </h2>
      {term.shortDescription && (
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {term.shortDescription}
        </p>
      )}
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Eye className="size-3.5 text-brand-blue" />
        {new Intl.NumberFormat("tr-TR").format(term.views)} görüntülenme
      </p>
    </Link>
  );
}

export function DictionaryPage({
  groups,
  categories,
  initialSearch = "",
  initialCategory = "",
}: DictionaryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const totalTerms = useMemo(
    () => groups.reduce((sum, g) => sum + g.terms.length, 0),
    [groups]
  );

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
    router.push(`/sozluk?${params.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyFilters();
  };

  return (
    <main className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            PDR Sözlüğü
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Psikoloji ve rehberlik alanındaki terimlerin alfabetik sözlüğü.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Terim ara..."
              className="rounded-xl pl-9"
            />
          </div>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="sm:w-56"
            aria-label="Kategori filtresi"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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

        {totalTerms === 0 ? (
          <EmptyState
            title="Terim bulunamadı"
            description={
              initialSearch || initialCategory
                ? "Arama kriterlerinize uygun terim bulunamadı. Farklı bir arama deneyin."
                : "Henüz yayınlanmış terim bulunmuyor. Yakında yeni terimler eklenecek."
            }
            icon="file"
          />
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.letter} id={`letter-${group.letter}`}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-navy text-lg font-bold text-white">
                    {group.letter}
                  </span>
                  <h2 className="text-xl font-semibold text-brand-navy">
                    {group.letter} Harfi
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({group.terms.length} terim)
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.terms.map((term) => (
                    <DictionaryTermCard key={term.id} term={term} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {groups.length > 1 && (
          <nav
            className="mt-12 flex flex-wrap justify-center gap-2"
            aria-label="Alfabetik gezinme"
          >
            {groups.map((group) => (
              <a
                key={group.letter}
                href={`#letter-${group.letter}`}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                  "border-slate-200 text-brand-navy hover:border-brand-blue hover:bg-brand-blue/5 hover:text-brand-blue"
                )}
              >
                {group.letter}
              </a>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}
