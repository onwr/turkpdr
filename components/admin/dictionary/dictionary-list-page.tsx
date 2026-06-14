"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Eye,
  FilePen,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import type { DictionaryStatus } from "@prisma/client";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DICTIONARY_CATEGORIES,
  dictionaryStatusLabels,
  type DictionaryListItem,
} from "@/types/dictionary";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";

type UserRole = "ADMIN" | "EDITOR" | "AUTHOR" | "MEMBER";

const statusOptions: { value: DictionaryStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "DRAFT", label: "Taslak" },
  { value: "PUBLISHED", label: "Yayında" },
];

const statusStyles: Record<DictionaryStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
};

type DictionaryListPageProps = {
  userRole: UserRole;
};

export function DictionaryListPage({ userRole }: DictionaryListPageProps) {
  const [terms, setTerms] = useState<DictionaryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DictionaryStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const canDelete = userRole === "ADMIN";

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    appendListPagination(params, page);

    try {
      const res = await fetch(`/api/admin/dictionary?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terimler yüklenemedi.");
      setTerms(data.terms);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchTerms(), 300);
    return () => clearTimeout(timer);
  }, [fetchTerms]);

  const requestDelete = (id: string, title: string) => {
    setConfirmState({
      title: "Terimi Sil",
      description: `"${title}" terimini silmek istediğinize emin misiniz?`,
      confirmLabel: "Sil",
      variant: "destructive",
      onConfirm: async () => {
        setActionLoading(id);
        setError(null);
        setSuccess(null);
        try {
          const res = await fetch(`/api/admin/dictionary/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Terim silinemedi.");
          setSuccess(data.message || "Terim silindi.");
          setConfirmState(null);
          await fetchTerms();
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
            Sözlük Yönetimi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Psikoloji ve PDR terimlerini yönetin.
          </p>
        </div>
        <Button
          className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
          asChild
        >
          <Link href="/admin/dictionary/new">
            <Plus className="size-4" />
            Yeni Terim
          </Link>
        </Button>
      </div>

      <AdminListAlerts error={error} success={success} />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Terim veya kategori ara..."
              className="rounded-xl pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as DictionaryStatus | "");
              setPage(1);
            }}
            className="sm:w-44"
            aria-label="Durum filtresi"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="sm:w-48"
            aria-label="Kategori filtresi"
          >
            <option value="">Tüm Kategoriler</option>
            {DICTIONARY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-xl"
            onClick={() => void fetchTerms()}
            aria-label="Yenile"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-4 text-brand-blue" />
            Terimler
          </CardTitle>
          <CardDescription>{total} terim listeleniyor</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Görüntülenme</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && terms.length === 0 ? (
                  <AdminTableLoadingRow colSpan={5} />
                ) : terms.length === 0 ? (
                  <AdminTableEmptyRow colSpan={5} label="Terim bulunamadı." />
                ) : (
                  terms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell>
                        <div className="min-w-[160px]">
                          <p className="font-medium text-brand-navy">
                            {term.title}
                          </p>
                          {term.shortDescription && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {term.shortDescription}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {term.category ? (
                          <Badge variant="secondary">{term.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Eye className="size-3.5" />
                          {term.views}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className={statusStyles[term.status]}
                          >
                            {dictionaryStatusLabels[term.status]}
                          </Badge>
                          <ScheduledBadge scheduledAt={term.scheduledAt} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            className="rounded-lg"
                            asChild
                          >
                            <Link href={`/admin/dictionary/${term.id}/edit`}>
                              <FilePen className="size-3.5" />
                              <span className="hidden sm:inline">Düzenle</span>
                            </Link>
                          </Button>
                          {canDelete && (
                            <Button
                              size="xs"
                              variant="destructive"
                              className="rounded-lg"
                              disabled={actionLoading === term.id}
                              onClick={() =>
                                requestDelete(term.id, term.title)
                              }
                            >
                              <Trash2 className="size-3.5" />
                              <span className="hidden sm:inline">Sil</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

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
