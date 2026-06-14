"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Film,
  ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";

import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { uploadFile } from "@/lib/upload-client";
import type { MediaAssetItem, MediaTypeFilter } from "@/types/media";
import { formatFileSize, IMAGE_ACCEPT, PDF_ACCEPT, VIDEO_ACCEPT } from "@/types/upload";
import { cn } from "@/lib/utils";

export type SelectedMedia = {
  url: string;
  fileName: string;
  fileType: string;
  category: string;
};

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: SelectedMedia) => void;
  mediaType?: Exclude<MediaTypeFilter, "all">;
  uploadUrl?: string;
  title?: string;
};

function filterToApiType(
  mediaType?: Exclude<MediaTypeFilter, "all">
): MediaTypeFilter {
  return mediaType ?? "all";
}

function getAcceptForType(mediaType?: Exclude<MediaTypeFilter, "all">): string {
  switch (mediaType) {
    case "image":
      return IMAGE_ACCEPT;
    case "pdf":
      return PDF_ACCEPT;
    case "video":
      return VIDEO_ACCEPT;
    default:
      return `${IMAGE_ACCEPT},${PDF_ACCEPT},${VIDEO_ACCEPT}`;
  }
}

function MediaThumbnail({ item }: { item: MediaAssetItem }) {
  if (item.category === "images") {
    return (
      <Image
        src={item.fileUrl}
        alt={item.fileName}
        fill
        className="object-cover"
        sizes="160px"
        unoptimized
      />
    );
  }

  if (item.category === "videos") {
    return (
      <div className="flex size-full items-center justify-center bg-slate-900 text-white">
        <Film className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-red-50 text-red-600">
      <FileText className="size-8" />
      <span className="text-xs font-semibold">PDF</span>
    </div>
  );
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  mediaType,
  uploadUrl = "/api/admin/upload",
  title = "Medya Seç",
}: MediaPickerDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState("library");
  const [items, setItems] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastOpen, setLastOpen] = useState(open);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setTab("library");
      setPage(1);
      setSearch("");
      setError(null);
    }
  }

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    const type = filterToApiType(mediaType);
    if (type !== "all") params.set("type", type);
    if (search.trim()) params.set("search", search.trim());
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
  }, [mediaType, search, page]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      void fetchMedia();
    }, 300);
    return () => clearTimeout(timer);
  }, [open, fetchMedia]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    const result = await uploadFile(file, uploadUrl);
    if (!result.success) {
      setError(result.message);
      setUploading(false);
      return;
    }

    onSelect({
      url: result.url,
      fileName: result.fileName,
      fileType: result.fileType,
      category:
        result.fileType.startsWith("image/")
          ? "images"
          : result.fileType.startsWith("video/")
            ? "videos"
            : "files",
    });
    onOpenChange(false);
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Yeni dosya yükleyin veya medya kütüphanesinden seçin.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="library">Kütüphaneden Seç</TabsTrigger>
              <TabsTrigger value="upload">Yeni Yükle</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="mt-4 space-y-4">
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Dosya adı veya URL ara..."
                className="rounded-xl"
              />

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Yükleniyor...
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-sm text-muted-foreground">
                  Medya bulunamadı.
                </div>
              ) : (
                <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all hover:border-brand-blue/40 hover:shadow-md"
                      onClick={() => {
                        onSelect({
                          url: item.fileUrl,
                          fileName: item.fileName,
                          fileType: item.fileType,
                          category: item.category,
                        });
                        onOpenChange(false);
                      }}
                    >
                      <div className="relative aspect-square bg-slate-100">
                        <MediaThumbnail item={item} />
                      </div>
                      <div className="space-y-0.5 p-2">
                        <p className="truncate text-xs font-medium text-brand-navy">
                          {item.title || item.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatFileSize(item.fileSize)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <AdminPagination
                page={page}
                totalPages={totalPages}
                total={total}
                loading={loading}
                onPageChange={setPage}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <input
                ref={inputRef}
                type="file"
                accept={getAcceptForType(mediaType)}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = "";
                }}
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5",
                  uploading && "opacity-60"
                )}
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                  {uploading ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <Upload className="size-6" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-brand-navy">
                    {uploading ? "Yükleniyor..." : "Dosya yükle"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bilgisayarınızdan seçin
                  </p>
                </div>
              </button>

              {error && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t border-slate-200 px-6 py-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MediaInsertMenu({
  open,
  onOpenChange,
  onUpload,
  onLibrary,
  label,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: () => void;
  onLibrary: () => void;
  label: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            Yeni yükleme yapın veya medya kütüphanesinden seçin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            className="justify-start rounded-xl"
            onClick={() => {
              onOpenChange(false);
              onUpload();
            }}
          >
            <Upload className="size-4" />
            Yeni Yükle
          </Button>
          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={() => {
              onOpenChange(false);
              onLibrary();
            }}
          >
            <ImageIcon className="size-4" />
            Medya Kütüphanesinden Seç
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
