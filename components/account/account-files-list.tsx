import type { ContentStatus } from "@prisma/client";
import { Download } from "lucide-react";

import type { AccountFileItem } from "@/types/account";
import { formatFileSize } from "@/types/upload";
import { cn } from "@/lib/utils";

type AccountFilesListProps = {
  items: AccountFileItem[];
  emptyMessage?: string;
};

const statusLabels: Record<ContentStatus, string> = {
  DRAFT: "Taslak",
  PENDING: "Onay Bekliyor",
  PUBLISHED: "Yayında",
  REJECTED: "Reddedildi",
  REVISION_REQUESTED: "Revizyon İstendi",
};

const statusStyles: Record<ContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  REVISION_REQUESTED: "bg-orange-100 text-orange-700",
};

export function AccountFilesList({
  items,
  emptyMessage = "Henüz dosya yüklenmemiş.",
}: AccountFilesListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-blue">
              <Download className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-brand-navy">{item.title}</h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusStyles[item.status]
                  )}
                >
                  {statusLabels[item.status]}
                </span>
              </div>
              {item.description ? (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              ) : null}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{item.createdAt}</span>
                {item.fileSize ? (
                  <span>{formatFileSize(item.fileSize)}</span>
                ) : null}
                {item.status === "PUBLISHED" ? (
                  <span>{item.downloads} indirme</span>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
