import Link from "next/link";
import { ClipboardList } from "lucide-react";

import type { AccountTestResultItem } from "@/types/account";

type AccountTestResultsProps = {
  items: AccountTestResultItem[];
  emptyMessage?: string;
};

export function AccountTestResults({
  items,
  emptyMessage = "Henüz test sonucu bulunmuyor.",
}: AccountTestResultsProps) {
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
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <ClipboardList className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="font-semibold text-brand-navy">
                <Link href={item.href} className="hover:text-brand-blue">
                  {item.testTitle}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">{item.resultLabel}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Puan: {item.totalScore}/{item.maxScore}
                </span>
                <span>{item.createdAt}</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
