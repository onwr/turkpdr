import Link from "next/link";
import { Calendar, Download, FileText } from "lucide-react";

import type { ProfileFile } from "@/types/profile";

function formatDownloadCount(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

type ProfileFilesProps = {
  files: ProfileFile[];
};

export function ProfileFiles({ files }: ProfileFilesProps) {
  if (files.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">
        Henüz dosya paylaşılmamış.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {files.map((file) => (
        <article
          key={file.id}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all hover:border-brand-blue/20 hover:shadow-md"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FileText className="size-5" />
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {file.fileType}
            </span>
          </div>

          <h3 className="font-semibold text-brand-navy transition-colors group-hover:text-brand-blue">
            <a href={`/api/files/${file.id}/download`} download>
              {file.name}
            </a>
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">{file.category}</p>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Download className="size-3.5 text-brand-blue" />
              {formatDownloadCount(file.downloadCount)} indirme
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {file.date}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
