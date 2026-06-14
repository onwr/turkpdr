import Link from "next/link";
import { AlertCircle, Clock, Eye, FileText, Pencil, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canAuthorEditContent, canAuthorResubmit } from "@/lib/content-review";
import type { AccountContentItem } from "@/types/account";
import { contentStatusLabels, contentStatusStyles } from "@/types/content";
import { cn } from "@/lib/utils";

type AccountContentListProps = {
  items: AccountContentItem[];
  emptyMessage?: string;
  showCreateButton?: boolean;
};

export function AccountContentList({
  items,
  emptyMessage = "Henüz paylaşım bulunmuyor.",
  showCreateButton = false,
}: AccountContentListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {showCreateButton && (
          <Button className="mt-4 rounded-xl bg-brand-blue" asChild>
            <Link href="/hesabim/paylasimlar/yeni">Yeni Paylaşım</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const canEdit = canAuthorEditContent(item.status);
        const showReviewNote = canAuthorResubmit(item.status);

        return (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                      contentStatusStyles[item.status]
                    )}
                  >
                    {contentStatusLabels[item.status]}
                  </span>
                  <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
                    {item.typeLabel}
                  </span>
                  {item.category ? (
                    <span className="text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  ) : null}
                </div>

                <h3 className="font-semibold text-brand-navy">
                  {item.href ? (
                    <Link href={item.href} className="hover:text-brand-blue">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>

                {showReviewNote && item.reviewNote ? (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-orange-700">
                      <AlertCircle className="size-3.5" />
                      Editör Notu
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {item.reviewNote}
                    </p>
                    {item.reviewedAt ? (
                      <p className="mt-1 text-xs text-orange-700">
                        {item.reviewedAt}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {item.createdAt}
                  </span>
                  {item.status === "PUBLISHED" ? (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3.5" />
                      {item.views} görüntülenme
                    </span>
                  ) : null}
                </div>

                {canEdit ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      asChild
                    >
                      <Link href={`/hesabim/paylasimlar/${item.id}/duzenle`}>
                        <Pencil className="size-3.5" />
                        Düzenle ve Tekrar Gönder
                      </Link>
                    </Button>
                    {canAuthorResubmit(item.status) && (
                      <Button
                        size="sm"
                        className="rounded-xl bg-brand-blue"
                        asChild
                      >
                        <Link href={`/hesabim/paylasimlar/${item.id}/duzenle`}>
                          <Send className="size-3.5" />
                          Tekrar Onaya Gönder
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-brand-blue">
                <FileText className="size-4" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
