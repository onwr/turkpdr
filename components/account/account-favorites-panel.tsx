"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bookmark,
  ExternalLink,
  Loader2,
  Newspaper,
  PenLine,
  Search,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import type { ContentType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AccountFavoriteItem } from "@/types/account";
import { cn } from "@/lib/utils";

type AccountFavoritesPanelProps = {
  initialItems: AccountFavoriteItem[];
};

const filterTabs: { id: "all" | ContentType; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "ARTICLE", label: "Makale" },
  { id: "NEWS", label: "Haber" },
  { id: "GUIDE", label: "Rehber" },
  { id: "VIDEO", label: "Video" },
  { id: "PSIKO_SANAT", label: "Psiko Sanat" },
];

function getTypeIcon(type: ContentType) {
  switch (type) {
    case "NEWS":
      return Newspaper;
    case "VIDEO":
      return Video;
    default:
      return PenLine;
  }
}

export function AccountFavoritesPanel({
  initialItems,
}: AccountFavoritesPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<"all" | ContentType>("all");
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.typeLabel.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search]);

  async function handleRemove(favoriteId: string) {
    setRemovingId(favoriteId);
    setError(null);

    try {
      const res = await fetch(`/api/account/favorites/${favoriteId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Favori kaldırılamadı.");
      }

      setItems((current) => current.filter((item) => item.id !== favoriteId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="size-5 text-brand-blue" />
            Favoriler Nasıl Çalışır?
          </CardTitle>
          <CardDescription>
            Yayınlanmış makale ve haberleri kaydetmek için içerik sayfasındaki
            &quot;Favorilere Ekle&quot; butonunu kullanın.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-medium text-brand-navy">1. İçeriği açın</p>
            <p className="mt-1 text-muted-foreground">
              Makale veya haber detay sayfasına gidin.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-medium text-brand-navy">2. Favoriye ekleyin</p>
            <p className="mt-1 text-muted-foreground">
              Giriş yaptıktan sonra &quot;Favorilere Ekle&quot; butonuna tıklayın.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-medium text-brand-navy">3. Buradan yönetin</p>
            <p className="mt-1 text-muted-foreground">
              Kaydettiğiniz içerikler bu listede görünür ve kaldırılabilir.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Toplam <span className="font-semibold text-brand-navy">{items.length}</span>{" "}
            favori
          </p>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Favorilerde ara..."
              className="rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const count =
              tab.id === "all"
                ? items.length
                : items.filter((item) => item.type === tab.id).length;

            if (tab.id !== "all" && count === 0) return null;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === tab.id
                    ? "bg-brand-blue text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Sparkles className="size-5" />
            </div>
            <p className="font-medium text-brand-navy">
              {items.length === 0
                ? "Henüz favori eklemediniz"
                : "Bu filtrede favori bulunamadı"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              İlginizi çeken içerikleri favorilere ekleyerek daha sonra kolayca
              ulaşabilirsiniz.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button className="rounded-xl bg-brand-blue" asChild>
                <Link href="/makaleler">Makalelere Göz At</Link>
              </Button>
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/haberler">Haberleri İncele</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const Icon = getTypeIcon(item.type);

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-blue/20 sm:flex-row sm:items-center"
                >
                  <Link
                    href={item.href}
                    className="relative block h-24 w-full shrink-0 overflow-hidden rounded-xl sm:size-28"
                  >
                    <Image
                      src={item.coverImage ?? "/images/placeholder.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </Link>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
                        <Icon className="size-3.5" />
                        {item.typeLabel}
                      </span>
                      {item.category ? (
                        <span className="text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {item.savedAt}
                      </span>
                    </div>

                    <h3 className="font-semibold text-brand-navy">
                      <Link href={item.href} className="hover:text-brand-blue">
                        {item.title}
                      </Link>
                    </h3>

                    {item.summary ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.summary}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      asChild
                    >
                      <Link href={item.href}>
                        <ExternalLink className="size-4" />
                        Aç
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => void handleRemove(item.id)}
                      disabled={removingId === item.id}
                    >
                      {removingId === item.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Kaldır
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
