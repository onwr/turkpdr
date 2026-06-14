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
  X,
  MessageSquareWarning,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AssignedEditorSelect } from "@/components/admin/shared/assigned-editor-select";
import {
  AdminConfirmDialog,
  type AdminConfirmState,
} from "@/components/admin/shared/admin-confirm-dialog";
import { ContentReviewNoteDialog } from "@/components/admin/shared/content-review-note-dialog";
import { AdminListAlerts } from "@/components/admin/shared/admin-list-alerts";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import { ScheduledBadge } from "@/components/admin/shared/scheduled-badge";
import {
  AdminTableEmptyRow,
  AdminTableLoadingRow,
} from "@/components/admin/shared/admin-table-states";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  contentTypeLabels,
  toPrismaContentStatus,
  type AppContentStatus,
  type ContentListItem,
} from "@/types/content";
import type { ContentType } from "@prisma/client";
import {
  formatContentDate,
  getContentStatusConfirmMessage,
  getContentViewUrl,
} from "@/lib/admin/content-display";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";

type UserRole = "ADMIN" | "EDITOR" | "AUTHOR" | "MEMBER";

const typeOptions: { value: ContentType | ""; label: string }[] = [
  { value: "", label: "Tüm Türler" },
  { value: "NEWS", label: "Haber" },
  { value: "ARTICLE", label: "Makale" },
  { value: "GUIDE", label: "Rehberlik Yazısı" },
  { value: "METAPHOR", label: "Terapi Metaforu" },
  { value: "PSIKO_SANAT", label: "Psiko Sanat Kitap" },
  { value: "VIDEO", label: "Video" },
  { value: "FILE", label: "Dosya" },
];

const statusOptions: { value: AppContentStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "DRAFT", label: "Taslak" },
  { value: "PENDING", label: "Onay Bekliyor" },
  { value: "PUBLISHED", label: "Yayında" },
  { value: "REJECTED", label: "Reddedildi" },
  { value: "REVISION_REQUESTED", label: "Revizyon İstendi" },
];

type ReviewDialogState = {
  id: string;
  title: string;
  status: Extract<AppContentStatus, "REJECTED" | "REVISION_REQUESTED">;
} | null;

type ContentsListPageProps = {
  userRole: UserRole;
  currentUserId: string;
  initialType?: ContentType;
  initialAuthorId?: string;
};

export function ContentsListPage({
  userRole,
  initialType,
  initialAuthorId,
}: ContentsListPageProps) {
  const [contents, setContents] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType | "">(
    initialType ?? ""
  );
  const [statusFilter, setStatusFilter] = useState<AppContentStatus | "">("");
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "mine">(
    "all"
  );
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState>(null);
  const [reviewDialogLoading, setReviewDialogLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const canDelete = userRole === "ADMIN";

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (initialAuthorId) params.set("authorId", initialAuthorId);
    if (assignmentFilter === "mine") params.set("assignment", "mine");
    appendListPagination(params, page);

    try {
      const res = await fetch(`/api/admin/contents?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "İçerikler yüklenemedi.");
      }

      setContents(data.contents);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, assignmentFilter, initialAuthorId, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchContents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchContents]);

  const requestStatusUpdate = (
    id: string,
    title: string,
    status: AppContentStatus,
    reviewNote?: string
  ) => {
    if (
      (status === "REJECTED" || status === "REVISION_REQUESTED") &&
      !reviewNote
    ) {
      setReviewDialog({ id, title, status });
      return;
    }

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
            body: JSON.stringify({
              status: toPrismaContentStatus(status),
              reviewNote,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Durum güncellenemedi.");
          setConfirmState(null);
          setReviewDialog(null);
          await fetchContents();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleReviewDialogSubmit = async (reviewNote: string) => {
    if (!reviewDialog) return;
    setReviewDialogLoading(true);
    setActionLoading(reviewDialog.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/contents/${reviewDialog.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: reviewDialog.status,
            reviewNote,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Durum güncellenemedi.");
      setReviewDialog(null);
      await fetchContents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setReviewDialogLoading(false);
      setActionLoading(null);
    }
  };

  const requestDelete = (id: string, title: string) => {
    setConfirmState({
      title: "İçeriği Sil",
      description: `"${title}" içeriğini silmek istediğinize emin misiniz?`,
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
          if (!res.ok) throw new Error(data.error || "İçerik silinemedi.");
          setConfirmState(null);
          await fetchContents();
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
            İçerik Yönetimi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tüm içerikleri listeleyin, filtreleyin ve yönetin.
          </p>
        </div>
        <Button className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20" asChild>
          <Link href="/admin/contents/new">
            <Plus className="size-4" />
            Yeni İçerik
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
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as ContentType | "");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Tür filtresi"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as AppContentStatus | "");
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
        {(userRole === "ADMIN" || userRole === "EDITOR") && (
          <select
            value={assignmentFilter}
            onChange={(e) => {
              setAssignmentFilter(e.target.value as "all" | "mine");
              setPage(1);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            aria-label="Atama filtresi"
          >
            <option value="all">Tüm Bekleyenler</option>
            <option value="mine">Bana Atananlar</option>
          </select>
        )}
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => void fetchContents()}
          aria-label="Yenile"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </Button>
      </div>

      <AdminListAlerts error={error} />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  Başlık
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Tür</th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Kategori
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Yazar</th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Durum</th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Atanan Editör
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Öne Çıkan
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Tarih</th>
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && contents.length === 0 ? (
                <AdminTableLoadingRow colSpan={9} />
              ) : contents.length === 0 ? (
                <AdminTableEmptyRow colSpan={9} label="İçerik bulunamadı." />
              ) : (
                contents.map((item) => {
                  const viewUrl = getContentViewUrl(item.type, item.slug);
                  const isBusy = actionLoading === item.id;

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="max-w-[200px] truncate px-5 py-3.5 font-medium text-brand-navy sm:max-w-none sm:px-6">
                        {item.title}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {contentTypeLabels[item.type]}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {item.category?.name ?? "—"}
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {item.author.name}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ContentStatusBadge status={item.status} />
                          <ScheduledBadge scheduledAt={item.scheduledAt} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <AssignedEditorSelect
                          contentId={item.id}
                          value={item.assignedEditorId}
                          disabled={isBusy}
                          onAssigned={() => void fetchContents()}
                          onError={setError}
                        />
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
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                        {formatContentDate(item.createdAt)}
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
                              title="Yalnızca yayınlanmış içerikler görüntülenebilir"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          )}
                          <Button size="xs" variant="outline" className="rounded-lg" asChild>
                            <Link href={`/admin/contents/${item.id}/edit`}>
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
                          {item.status !== "REJECTED" &&
                            item.status !== "REVISION_REQUESTED" && (
                            <Button
                              size="xs"
                              variant="outline"
                              className="rounded-lg text-red-600 hover:bg-red-50"
                              disabled={isBusy}
                              onClick={() =>
                                requestStatusUpdate(
                                  item.id,
                                  item.title,
                                  "REJECTED"
                                )
                              }
                            >
                              <X className="size-3.5" />
                              <span className="hidden xl:inline">Reddet</span>
                            </Button>
                          )}
                          {item.status === "PENDING" && (
                            <Button
                              size="xs"
                              variant="outline"
                              className="rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50"
                              disabled={isBusy}
                              onClick={() =>
                                requestStatusUpdate(
                                  item.id,
                                  item.title,
                                  "REVISION_REQUESTED"
                                )
                              }
                            >
                              <MessageSquareWarning className="size-3.5" />
                              <span className="hidden xl:inline">
                                Revizyon İste
                              </span>
                            </Button>
                          )}
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

      <ContentReviewNoteDialog
        open={reviewDialog !== null}
        title={reviewDialog?.title ?? ""}
        status={reviewDialog?.status ?? "REJECTED"}
        loading={reviewDialogLoading}
        onClose={() => setReviewDialog(null)}
        onSubmit={handleReviewDialogSubmit}
      />

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
