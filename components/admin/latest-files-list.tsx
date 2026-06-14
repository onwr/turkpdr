import Link from "next/link";
import { FileText } from "lucide-react";
import type { ContentStatus } from "@prisma/client";

import { formatContentDate } from "@/lib/admin/content-display";
import { contentStatusLabels } from "@/types/content";
import type { DashboardFile } from "@/types/admin";
import { cn } from "@/lib/utils";

const statusStyles: Record<ContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  REVISION_REQUESTED: "bg-orange-50 text-orange-700 ring-orange-200",
};

type LatestFilesListProps = {
  files: DashboardFile[];
};

export function LatestFilesList({ files }: LatestFilesListProps) {
  return (
    <section
      aria-labelledby="latest-files-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2
            id="latest-files-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            Son Dosyalar
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Yüklenen son dosyalar
          </p>
        </div>
        <Link
          href="/admin/files"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Tümü
        </Link>
      </div>

      {files.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Henüz dosya bulunmuyor.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {files.map((file) => (
            <li key={file.id}>
              <Link
                href={file.editUrl}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-brand-navy">
                    {file.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {file.uploadedBy}
                    {file.fileType ? ` · ${file.fileType}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset sm:inline-flex",
                    statusStyles[file.status]
                  )}
                >
                  {contentStatusLabels[file.status]}
                </span>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {formatContentDate(file.createdAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
