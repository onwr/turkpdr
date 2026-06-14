"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Eye,
  FileText,
  Film,
  Grid3x3,
  ImageIcon,
  LayoutList,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminConfirmDialog,
  type AdminConfirmState,
} from "@/components/admin/shared/admin-confirm-dialog";
import { AdminListAlerts } from "@/components/admin/shared/admin-list-alerts";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { formatContentDate } from "@/lib/admin/content-display";
import { uploadFile } from "@/lib/upload-client";
import type {
  MediaAssetDetail,
  MediaAssetItem,
  MediaTypeFilter,
} from "@/types/media";
import { MEDIA_TYPE_FILTER_OPTIONS, getMediaTypeLabel } from "@/types/media";
import { formatFileSize } from "@/types/upload";
import { cn } from "@/lib/utils";

type UserRole = "ADMIN" | "EDITOR" | "AUTHOR" | "MEMBER";

type MediaLibraryPageProps = {
  userRole: UserRole;
};

function MediaPreview({ item }: { item: MediaAssetItem }) {
  if (item.category === "images") {
    return (
      <Image
        src={item.fileUrl}
        alt={item.fileName}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 200px"
        unoptimized
      />
    );
  }

  if (item.category === "videos") {
    return (
      <div className="flex size-full items-center justify-center bg-slate-900 text-white">
        <Film className="size-10" />
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-red-50 text-red-600">
      <FileText className="size-10" />
      <span className="text-sm font-semibold">PDF</span>
    </div>
  );
}

export function MediaLibraryPage({ userRole }: MediaLibraryPageProps) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [previewItem, setPreviewItem] = useState<MediaAssetItem | null>(null);
  const [detailItem, setDetailItem] = useState<MediaAssetDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canDelete = userRole === "ADMIN";

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (typeFilter !== "all") params.set("type", typeFilter);
    appendListPagination(params, page, 24);

    try {
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Medya yüklenemedi.");
      setItems(data.media);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Medya yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMedia();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMedia]);

  const openDetail = async (item: MediaAssetItem) => {
    setDetailLoading(true);
    setDetailItem(null);

    try {
      const res = await fetch(`/api/admin/media/${item.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Detay yüklenemedi.");
      setDetailItem(data.media);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detay yüklenemedi.");
    } finally {
      setDetailLoading(false);
    }
  };

  const copyUrl = async (item: MediaAssetItem) => {
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${item.fileUrl}`
        : item.fileUrl;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("URL kopyalanamadı.");
    }
  };

  const requestDelete = (item: MediaAssetItem) => {
    setConfirmState({
      title: "Medyayı Sil",
      description: `"${item.fileName}" dosyasını kalıcı olarak silmek istediğinize emin misiniz?`,
      confirmLabel: "Sil",
      variant: "destructive",
      onConfirm: async () => {
        setError(null);
        setSuccess(null);

        const res = await fetch(`/api/admin/media/${item.id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 409 && data.usages?.length) {
            setConfirmState(null);
            setDetailItem({
              ...item,
              uploadedBy: item.uploadedBy,
              usages: data.usages,
            });
            setError(data.error);
            return;
          }
          throw new Error(data.error || "Silme başarısız.");
        }

        setConfirmState(null);
        setDetailItem(null);
        setSuccess(data.message || "Medya silindi.");
        await fetchMedia();
      },
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    const result = await uploadFile(file);
    if (!result.success) {
      setError(result.message);
      setUploading(false);
      return;
    }

    setSuccess("Dosya medya kütüphanesine yüklendi.");
    setUploading(false);
    await fetchMedia();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-navy">
            <ImageIcon className="size-6 text-brand-blue" />
            Medya Kütüphanesi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yüklenen tüm görseller, PDF&apos;ler ve videoları merkezi olarak
            yönetin.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={uploadRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
            disabled={uploading}
            onClick={() => uploadRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Yeni Yükle
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Dosya adı veya URL ara..."
            className="rounded-xl pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as MediaTypeFilter);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Tür filtresi"
        >
          {MEDIA_TYPE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex gap-1 rounded-xl border border-slate-200 p-1">
          <Button
            size="icon-sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            className="rounded-lg"
            onClick={() => setViewMode("grid")}
            aria-label="Grid görünüm"
          >
            <Grid3x3 className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            className="rounded-lg"
            onClick={() => setViewMode("list")}
            aria-label="Liste görünüm"
          >
            <LayoutList className="size-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => void fetchMedia()}
          aria-label="Yenile"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </Button>
      </div>

      <AdminListAlerts error={error} success={success} />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" />
            Yükleniyor...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ImageIcon className="size-8" />
            </div>
            <p className="font-medium text-brand-navy">Henüz medya yok</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              İlk dosyanızı yükleyerek medya kütüphanenizi oluşturun.
            </p>
            <Button
              className="rounded-xl"
              onClick={() => uploadRef.current?.click()}
            >
              <Upload className="size-4" />
              Dosya Yükle
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {items.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-brand-blue/30 hover:shadow-md"
              >
                <button
                  type="button"
                  className="relative block aspect-square w-full bg-slate-100"
                  onClick={() => void openDetail(item)}
                >
                  <MediaPreview item={item} />
                </button>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium text-brand-navy">
                    {item.title || item.fileName}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span>·</span>
                    <span>{getMediaTypeLabel(item.category, item.fileType)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {formatContentDate(item.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="xs"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => setPreviewItem(item)}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => void copyUrl(item)}
                    >
                      <Copy className="size-3.5" />
                      {copiedId === item.id ? "OK" : ""}
                    </Button>
                    {canDelete && (
                      <Button
                        size="xs"
                        variant="destructive"
                        className="rounded-lg"
                        onClick={() => requestDelete(item)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Önizleme
                  </th>
                  <th className="px-3 py-3 font-medium text-muted-foreground">
                    Dosya
                  </th>
                  <th className="px-3 py-3 font-medium text-muted-foreground">
                    Tür
                  </th>
                  <th className="px-3 py-3 font-medium text-muted-foreground">
                    Boyut
                  </th>
                  <th className="px-3 py-3 font-medium text-muted-foreground">
                    Tarih
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="relative block size-14 overflow-hidden rounded-lg bg-slate-100"
                        onClick={() => void openDetail(item)}
                      >
                        <MediaPreview item={item} />
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-brand-navy">
                        {item.title || item.fileName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.fileName}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary">
                        {getMediaTypeLabel(item.category, item.fileType)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatFileSize(item.fileSize)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatContentDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          size="xs"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => setPreviewItem(item)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => void copyUrl(item)}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        {canDelete && (
                          <Button
                            size="xs"
                            variant="destructive"
                            className="rounded-lg"
                            onClick={() => requestDelete(item)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          loading={loading}
          onPageChange={setPage}
        />
      </section>

      <Dialog
        open={previewItem !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null);
        }}
      >
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.fileName}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              {previewItem.category === "images" ? (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={previewItem.fileUrl}
                    alt={previewItem.fileName}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : previewItem.category === "videos" ? (
                <video
                  src={previewItem.fileUrl}
                  controls
                  className="aspect-video w-full rounded-xl bg-slate-900"
                />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <FileText className="mx-auto size-12 text-red-500" />
                  <p className="mt-3 font-medium text-brand-navy">PDF Dosyası</p>
                  <a
                    href={previewItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-brand-blue hover:underline"
                  >
                    Dosyayı aç
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet
        open={detailItem !== null || detailLoading}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Medya Detayı</SheetTitle>
            <SheetDescription>
              Dosya bilgileri ve kullanım alanları
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            {detailLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" />
                Yükleniyor...
              </div>
            ) : detailItem ? (
              <div className="space-y-6">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                  <MediaPreview item={detailItem} />
                </div>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Dosya adı</dt>
                    <dd className="font-medium text-brand-navy">
                      {detailItem.fileName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tam URL</dt>
                    <dd className="break-all font-mono text-xs text-brand-navy">
                      {detailItem.fileUrl}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-muted-foreground">Boyut</dt>
                      <dd>{formatFileSize(detailItem.fileSize)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tür</dt>
                      <dd>
                        {getMediaTypeLabel(
                          detailItem.category,
                          detailItem.fileType
                        )}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Yükleyen</dt>
                    <dd>{detailItem.uploadedBy?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Yüklenme tarihi</dt>
                    <dd>{formatContentDate(detailItem.createdAt)}</dd>
                  </div>
                </dl>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-brand-navy">
                    Bu medya şu içeriklerde kullanılıyor
                  </h3>
                  {detailItem.usages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Henüz bir içerikte kullanılmıyor.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {detailItem.usages.map((usage) => (
                        <li
                          key={`${usage.type}-${usage.id}`}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        >
                          <Link
                            href={usage.adminUrl}
                            className="font-medium text-brand-blue hover:underline"
                          >
                            {usage.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {usage.context}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => void copyUrl(detailItem)}
                  >
                    <Copy className="size-4" />
                    URL Kopyala
                  </Button>
                  {canDelete && (
                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => requestDelete(detailItem)}
                    >
                      <Trash2 className="size-4" />
                      Sil
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </SheetBody>
        </SheetContent>
      </Sheet>

      <AdminConfirmDialog
        state={confirmState}
        loading={confirmLoading}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        onConfirm={() => {
          if (!confirmState) return;
          setConfirmLoading(true);
          void Promise.resolve(confirmState.onConfirm())
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "İşlem başarısız.");
            })
            .finally(() => setConfirmLoading(false));
        }}
      />
    </AdminLayout>
  );
}
