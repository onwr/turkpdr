"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  FileText,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import type { UserRole } from "@prisma/client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  userRoleLabels,
  userRoleStyles,
  type AdminAuthorItem,
} from "@/types/admin";
import { cn } from "@/lib/utils";

const roleOptions: { value: UserRole | ""; label: string }[] = [
  { value: "", label: "Tüm Roller" },
  { value: "ADMIN", label: "Yönetici" },
  { value: "EDITOR", label: "Editör" },
  { value: "AUTHOR", label: "Yazar" },
];

export function AuthorsListPage() {
  const [authors, setAuthors] = useState<AdminAuthorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/authors?${params.toString()}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Yazarlar yüklenemedi.");
      }
      const data = (await res.json()) as {
        authors: AdminAuthorItem[];
        totalPages: number;
      };
      setAuthors(data.authors);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yazarlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAuthors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAuthors]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Yazar Yönetimi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yazar, editör ve yönetici profillerini görüntüleyin.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Ad, e-posta veya ünvan ara..."
            className="rounded-xl pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | "");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Rol filtresi"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => void fetchAuthors()}
          aria-label="Yenile"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  Yazar
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Rol</th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Ünvan
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Uzmanlık
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  İçerik
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && authors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Yükleniyor...
                  </td>
                </tr>
              ) : authors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Yazar bulunamadı.
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr
                    key={author.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                          {author.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={author.avatar}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <Users className="size-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-brand-navy">
                            {author.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {author.email}
                          </p>
                          {author.bio && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {author.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                          userRoleStyles[author.role]
                        )}
                      >
                        {userRoleLabels[author.role]}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {author.title ?? "—"}
                    </td>
                    <td className="max-w-[180px] px-3 py-3.5">
                      {author.expertiseAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {author.expertiseAreas.slice(0, 2).map((area) => (
                            <span
                              key={area}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs"
                            >
                              {area}
                            </span>
                          ))}
                          {author.expertiseAreas.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{author.expertiseAreas.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {author.contentCount}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="xs"
                          variant="outline"
                          className="rounded-lg"
                          asChild
                        >
                          <Link
                            href={`/profil/${author.id}`}
                            target="_blank"
                          >
                            <ExternalLink className="size-3.5" />
                            Profil
                          </Link>
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="rounded-lg"
                          asChild
                        >
                          <Link
                            href={`/admin/contents?authorId=${author.id}`}
                          >
                            <FileText className="size-3.5" />
                            İçerikler
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 sm:px-6">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
            </Button>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
