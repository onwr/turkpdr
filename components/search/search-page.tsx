"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SearchResultGroup } from "@/components/search/search-result-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchResponse } from "@/types/search";

const emptyResults: SearchResponse = {
  query: "",
  contents: [],
  files: [],
  tests: [],
  users: [],
};

type SearchPageContentProps = {
  initialQuery: string;
};

function SearchPageContent({ initialQuery }: SearchPageContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResponse>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setResults(emptyResults);
      setHasSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Arama yapılamadı.");
      }

      setResults(data as SearchResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setResults({ ...emptyResults, query: trimmed });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void runSearch(initialQuery);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialQuery, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/arama?q=${encodeURIComponent(trimmed)}`);
  };

  const totalResults =
    results.contents.length +
    results.files.length +
    results.tests.length +
    results.users.length;

  return (
    <main className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              Arama
            </h1>
            <p className="mt-3 text-muted-foreground">
              Makale, haber, dosya, test ve yazarlar arasında arayın.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mb-10 flex max-w-3xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ne aramak istiyorsunuz?"
                className="h-12 rounded-2xl pl-12 text-base shadow-sm"
                aria-label="Arama terimi"
              />
            </div>
            <Button
              type="submit"
              className="h-12 rounded-2xl bg-brand-blue px-8 shadow-md shadow-brand-blue/20"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Ara
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mb-3 size-8 animate-spin text-brand-blue" />
              <p>Sonuçlar aranıyor...</p>
            </div>
          )}

          {!loading && !hasSearched && (
            <EmptyState
              title="Aramaya başlayın"
              description="Yukarıdaki kutuya anahtar kelime yazıp Enter'a basın veya Ara butonuna tıklayın."
              icon="inbox"
              className="mx-auto max-w-2xl"
            />
          )}

          {!loading && hasSearched && !error && totalResults === 0 && (
            <EmptyState
              title="Sonuç bulunamadı"
              description={`"${results.query}" için eşleşen içerik bulunamadı. Farklı anahtar kelimeler deneyin.`}
              icon="file"
              className="mx-auto max-w-2xl"
            />
          )}

          {!loading && !error && totalResults > 0 && (
            <div className="space-y-10">
              {results.query && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-brand-navy">
                    {totalResults}
                  </span>{" "}
                  sonuç bulundu: &quot;{results.query}&quot;
                </p>
              )}
              <SearchResultGroup title="İçerikler" items={results.contents} />
              <SearchResultGroup title="Dosyalar" items={results.files} />
              <SearchResultGroup title="Testler" items={results.tests} />
              <SearchResultGroup title="Yazarlar" items={results.users} />
            </div>
          )}
        </div>
    </main>
  );
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q")?.trim() ?? "";

  return <SearchPageContent key={urlQuery} initialQuery={urlQuery} />;
}
