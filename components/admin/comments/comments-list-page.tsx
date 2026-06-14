"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatContentDate, getContentViewUrl } from "@/lib/admin/content-display";
import { contentTypeLabels } from "@/types/content";
import type { AdminCommentItem } from "@/types/admin";
import { cn } from "@/lib/utils";

export function CommentsListPage() {
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [postIdFilter, setPostIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{
    ids: string[];
    label: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (postIdFilter.trim()) params.set("postId", postIdFilter.trim());
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Yorumlar yüklenemedi.");
      }
      const data = (await res.json()) as {
        comments: AdminCommentItem[];
        totalPages: number;
      };
      setComments(data.comments);
      setTotalPages(data.totalPages);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorumlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [search, postIdFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchComments();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchComments]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    }
  }

  async function deleteComments(ids: string[]) {
    setActionLoading(true);
    setError(null);

    try {
      if (ids.length === 1) {
        const res = await fetch(`/api/admin/comments/${ids[0]}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Yorum silinemedi.");
        }
      } else {
        const res = await fetch("/api/admin/comments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Yorumlar silinemedi.");
        }
      }

      setDeleteTarget(null);
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme işlemi başarısız.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Yorum Yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            İçeriklere yapılan yorumları görüntüleyin ve yönetin.
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              setDeleteTarget({
                ids: Array.from(selectedIds),
                label: `${selectedIds.size} yorumu silmek istediğinize emin misiniz?`,
              })
            }
          >
            <Trash2 className="size-4" />
            Seçilenleri Sil ({selectedIds.size})
          </Button>
        )}
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
            placeholder="Yorum, kullanıcı veya içerik ara..."
            className="rounded-xl pl-9"
          />
        </div>
        <Input
          value={postIdFilter}
          onChange={(e) => {
            setPostIdFilter(e.target.value);
            setPage(1);
          }}
          placeholder="İçerik ID filtresi"
          className="rounded-xl sm:max-w-[200px]"
        />
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => void fetchComments()}
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
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-3 py-3 sm:px-4">
                  <input
                    type="checkbox"
                    checked={
                      comments.length > 0 &&
                      selectedIds.size === comments.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="Tümünü seç"
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Kullanıcı
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Yorum
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  İçerik
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Tarih
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && comments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Yükleniyor...
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Yorum bulunamadı.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => {
                  const viewUrl = getContentViewUrl(
                    comment.post.type,
                    comment.post.slug
                  );

                  return (
                    <tr
                      key={comment.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-3 py-3.5 sm:px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(comment.id)}
                          onChange={() => toggleSelect(comment.id)}
                          aria-label={`${comment.user.name} yorumunu seç`}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-brand-navy">
                          {comment.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {comment.user.email}
                        </p>
                      </td>
                      <td className="max-w-[280px] px-3 py-3.5">
                        <p className="line-clamp-2 text-muted-foreground">
                          {comment.content}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-brand-navy">
                          {comment.post.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contentTypeLabels[comment.post.type]}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                        {formatContentDate(comment.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <div className="flex gap-1">
                          {viewUrl && (
                            <Button
                              size="xs"
                              variant="outline"
                              className="rounded-lg"
                              asChild
                            >
                              <Link href={viewUrl} target="_blank">
                                <ExternalLink className="size-3.5" />
                                Görüntüle
                              </Link>
                            </Button>
                          )}
                          <Button
                            size="xs"
                            variant="destructive"
                            className="rounded-lg"
                            onClick={() =>
                              setDeleteTarget({
                                ids: [comment.id],
                                label:
                                  "Bu yorumu silmek istediğinize emin misiniz?",
                              })
                            }
                          >
                            <Trash2 className="size-3.5" />
                            Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Yorumu Sil"
        description={deleteTarget?.label ?? ""}
        confirmLabel="Sil"
        variant="destructive"
        loading={actionLoading}
        onConfirm={() => {
          if (deleteTarget) void deleteComments(deleteTarget.ids);
        }}
      />
    </AdminLayout>
  );
}
