"use client";

import { useMemo, useState } from "react";
import { Download, FileText, User } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { FileCategoryGroup, PublicFileItem } from "@/types/files";
import { formatFileSize } from "@/types/upload";
import { cn } from "@/lib/utils";

function formatDownloadCount(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

type PublicFileCardProps = {
  file: PublicFileItem;
};

function PublicFileCard({ file }: PublicFileCardProps) {
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <FileText className="size-6" />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {file.fileType ?? "Dosya"}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-brand-navy transition-colors group-hover:text-brand-blue">
        {file.title}
      </h2>

      {file.description && (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {file.description}
        </p>
      )}

      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        {file.fileSize && (
          <p>Boyut: {formatFileSize(file.fileSize)}</p>
        )}
        <p className="inline-flex items-center gap-1.5">
          <Download className="size-4 text-brand-blue" />
          {formatDownloadCount(file.downloads)} indirme
        </p>
        <p className="inline-flex items-center gap-1.5">
          <User className="size-4 text-brand-blue" />
          {file.uploadedBy}
        </p>
      </div>

      <Button
        className="mt-5 w-full rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20 hover:bg-brand-blue/90"
        asChild
      >
        <a href={`/api/files/${file.id}/download`} download>
          <Download className="size-4" />
          İndir
        </a>
      </Button>
    </article>
  );
}

type FilesPageProps = {
  files: PublicFileItem[];
  categories: FileCategoryGroup[];
};

export function FilesPage({ files, categories }: FilesPageProps) {
  const [activeType, setActiveType] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    if (!activeType) return files;
    return files.filter(
      (f) => (f.fileType ?? "Diğer").toUpperCase() === activeType
    );
  }, [files, activeType]);

  return (
    <main className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              Dosya Merkezi
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Rehberlik formları, test materyalleri ve eğitim dokümanlarını
              ücretsiz indirin.
            </p>
          </div>

          {categories.length > 0 && (
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => setActiveType(null)}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all",
                  activeType === null
                    ? "border-brand-blue bg-brand-blue/5 shadow-md shadow-brand-blue/10"
                    : "border-slate-200 bg-white hover:border-brand-blue/30"
                )}
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Tüm Dosyalar
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-navy">
                  {files.length}
                </p>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => setActiveType(cat.type)}
                  className={cn(
                    "rounded-2xl border p-5 text-left transition-all",
                    activeType === cat.type
                      ? "border-brand-blue bg-brand-blue/5 shadow-md shadow-brand-blue/10"
                      : "border-slate-200 bg-white hover:border-brand-blue/30"
                  )}
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {cat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-brand-navy">
                    {cat.count}
                  </p>
                </button>
              ))}
            </div>
          )}

          {filteredFiles.length === 0 ? (
            <EmptyState
              title="Henüz dosya yok"
              description="Yayınlanmış dosya bulunmuyor. Yakında yeni materyaller eklenecek."
              icon="file"
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFiles.map((file) => (
                <PublicFileCard key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
    </main>
  );
}
