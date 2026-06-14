"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  FilePen,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import type { ContentStatus } from "@prisma/client";

import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminConfirmDialog,
  type AdminConfirmState,
} from "@/components/admin/shared/admin-confirm-dialog";
import { AdminListAlerts } from "@/components/admin/shared/admin-list-alerts";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import { ScheduledBadge } from "@/components/admin/shared/scheduled-badge";
import {
  AdminTableEmptyRow,
  AdminTableLoadingRow,
} from "@/components/admin/shared/admin-table-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  contentStatusLabels,
  type ContentListItem,
} from "@/types/content";
import {
  formatContentDate,
  getContentStatusConfirmMessage,
  getContentViewUrl,
} from "@/lib/admin/content-display";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";

type UserRole = "ADMIN" | "EDITOR" | "AUTHOR" | "MEMBER";

const statusStyles: Record<ContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  REVISION_REQUESTED: "bg-orange-50 text-orange-700 ring-orange-200",
};

const statusOptions: { value: ContentStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "DRAFT", label: "Taslak" },
  { value: "PENDING", label: "Onay Bekliyor" },
  { value: "PUBLISHED", label: "Yayında" },
  { value: "REJECTED", label: "Reddedildi" },
  { value: "REVISION_REQUESTED", label: "Revizyon İstendi" },
];

function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        statusStyles[status]
      )}
    >
      {contentStatusLabels[status]}
    </span>
  );
}

function formatViews(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

type NewsListPageProps = {
  userRole: UserRole;
};

export function NewsListPage({ userRole }: NewsListPageProps) {
  const [news, setNews] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const canDelete = userRole === "ADMIN";

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ type: "NEWS" });
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    appendListPagination(params, page);

    try {
      const res = await fetch(`/api/admin/contents?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Haberler yüklenemedi.");
      }

      setNews(data.contents);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchNews(), 300);
    return () => clearTimeout(timer);
  }, [fetchNews]);

  const requestStatusUpdate = (
    id: string,
    title: string,
    status: ContentStatus
  ) => {
    const confirm = getContentStatusConfirmMessage(title, status);
    setConfirmState({
      ...confirm,
      onConfirm: async () => {
        setActionLoading(id);
        setError(null);
        try {
          const res = await fetch(`/api/admin/contents/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Durum güncellenemedi.");
          setConfirmState(null);
          await fetchNews();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    setActionLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Öne çıkarma güncellenemedi.");
      await fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  const requestDelete = (id: string, title: string) => {
    setConfirmState({
      title: "Haberi Sil",
      description: `"${title}" haberini silmek istediğinize emin misiniz?`,
      confirmLabel: "Sil",
      variant: "destructive",
      onConfirm: async () => {
        setActionLoading(id);
        setError(null);
        try {
          const res = await fetch(`/api/admin/contents/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Haber silinemedi.");
          setConfirmState(null);
          await fetchNews();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy sm:text-2xl">
            Haber Yönetimi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Haberleri listeleyin, oluşturun ve yayınlayın.
          </p>
        </div>
        <Button className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20" asChild>
          <Link href="/admin/news/new">
            <Plus className="size-4" />
            Yeni Haber
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Başlık veya özet ara..."
            className="rounded-xl pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ContentStatus | "");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Durum filtresi"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => void fetchNews()}
          aria-label="Yenile"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </Button>
      </div>

      <AdminListAlerts error={error} />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  Başlık
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Kategori
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Durum</th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Öne Çıkan
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Görüntülenme
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Tarih</th>
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && news.length === 0 ? (
                <AdminTableLoadingRow colSpan={7} />
              ) : news.length === 0 ? (
                <AdminTableEmptyRow colSpan={7} label="Haber bulunamadı." />
              ) : (
                news.map((item) => {
                  const viewUrl = getContentViewUrl(item.type, item.slug);
                  const isBusy = actionLoading === item.id;

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="max-w-[220px] truncate px-5 py-3.5 font-medium text-brand-navy sm:max-w-none sm:px-6">
                        {item.title}
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {item.category?.name ?? "—"}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={item.status} />
                          <ScheduledBadge scheduledAt={item.scheduledAt} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        {item.featured ? (
                          <Badge variant="default" className="gap-1">
                            <Star className="size-3 fill-current" />
                            Evet
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {formatViews(item.views)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                        {formatContentDate(item.publishedAt ?? item.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <div className="flex flex-wrap items-center gap-1">
                          {viewUrl && item.status === "PUBLISHED" ? (
                            <Button size="xs" variant="outline" className="rounded-lg" asChild>
                              <Link href={viewUrl} target="_blank">
                                <Eye className="size-3.5" />
                                <span className="hidden xl:inline">Görüntüle</span>
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              variant="outline"
                              className="rounded-lg"
                              disabled
                              title="Yalnızca yayınlanmış haberler görüntülenebilir"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          )}
                          <Button size="xs" variant="outline" className="rounded-lg" asChild>
                            <Link href={`/admin/news/${item.id}/edit`}>
                              <FilePen className="size-3.5" />
                              <span className="hidden xl:inline">Düzenle</span>
                            </Link>
                          </Button>
                          {item.status !== "PUBLISHED" && (
                            <Button
                              size="xs"
                              className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              disabled={isBusy}
                              onClick={() =>
                                requestStatusUpdate(
                                  item.id,
                                  item.title,
                                  "PUBLISHED"
                                )
                              }
                            >
                              <Rocket className="size-3.5" />
                              <span className="hidden xl:inline">Yayınla</span>
                            </Button>
                          )}
                          {item.status !== "DRAFT" && (
                            <Button
                              size="xs"
                              variant="secondary"
                              className="rounded-lg"
                              disabled={isBusy}
                              onClick={() =>
                                requestStatusUpdate(item.id, item.title, "DRAFT")
                              }
                            >
                              <Save className="size-3.5" />
                              <span className="hidden xl:inline">Taslağa Al</span>
                            </Button>
                          )}
                          <Button
                            size="xs"
                            variant={item.featured ? "secondary" : "outline"}
                            className={cn(
                              "rounded-lg",
                              !item.featured && "text-amber-600 hover:bg-amber-50"
                            )}
                            disabled={isBusy}
                            onClick={() => void toggleFeatured(item.id, !item.featured)}
                            title={item.featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                          >
                            <Star
                              className={cn(
                                "size-3.5",
                                item.featured && "fill-current text-amber-500"
                              )}
                            />
                            <span className="hidden xl:inline">
                              {item.featured ? "Kaldır" : "Öne Çıkar"}
                            </span>
                          </Button>
                          {canDelete && (
                            <Button
                              size="xs"
                              variant="destructive"
                              className="rounded-lg"
                              disabled={isBusy}
                              onClick={() => requestDelete(item.id, item.title)}
                            >
                              <Trash2 className="size-3.5" />
                              <span className="hidden xl:inline">Sil</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          loading={loading}
          onPageChange={setPage}
        />
      </section>

      <AdminConfirmDialog
        state={confirmState}
        loading={confirmLoading || actionLoading !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        onConfirm={() => void handleConfirm()}
      />
    </AdminLayout>
  );
}
