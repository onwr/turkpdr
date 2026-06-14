import { Download, FileText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { Button } from "@/components/ui/button";
import type { FileItem } from "@/types/home";
import { siteContainerClass, siteSectionClass } from "@/lib/site-layout";

function formatDownloadCount(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

function FileCard({ file }: { file: FileItem }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-sm shadow-brand-navy/5 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md hover:shadow-brand-blue/10 dark:bg-card dark:shadow-none sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <FileText className="size-6" />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:bg-muted">
          {file.category}
        </span>
      </div>

      <h3 className="font-semibold text-brand-navy transition-colors group-hover:text-brand-blue dark:text-foreground">
        {file.name}
      </h3>

      <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Download className="size-4 text-brand-blue" />
        <span>{formatDownloadCount(file.downloadCount)} indirme</span>
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

type FileCenterSectionProps = {
  files: FileItem[];
};

export function FileCenterSection({ files }: FileCenterSectionProps) {
  return (
    <section
      aria-labelledby="file-center-heading"
      className={`bg-white dark:bg-background ${siteSectionClass}`}
    >
      <div className={siteContainerClass}>
        <SectionHeader
          title="Dosya Merkezi"
          description="Rehberlik formları, test materyalleri ve eğitim dokümanlarını ücretsiz indirin."
          href="/dosyalar"
        />

        {files.length === 0 ? (
          <EmptyState
            title="Henüz dosya yok"
            description="Yayınlanmış dosya bulunmuyor. Yakında yeni materyaller eklenecek."
            icon="file"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
