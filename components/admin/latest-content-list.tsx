import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Newspaper,
  PenLine,
  Video,
} from "lucide-react";

import type { DashboardLatestContent } from "@/types/admin";
import { cn } from "@/lib/utils";

const typeIconMap = {
  Makale: PenLine,
  Haber: Newspaper,
  Dosya: FileText,
  Video: Video,
  Test: ClipboardList,
  "Rehberlik Yazısı": PenLine,
  "Terapi Metaforu": PenLine,
  "Psiko Sanat Kitap": PenLine,
} as const;

const defaultIcon = PenLine;

const typeColorMap: Record<string, string> = {
  Makale: "bg-indigo-50 text-indigo-600",
  Haber: "bg-sky-50 text-sky-600",
  Dosya: "bg-amber-50 text-amber-600",
  Video: "bg-violet-50 text-violet-600",
  Test: "bg-emerald-50 text-emerald-600",
  "Rehberlik Yazısı": "bg-indigo-50 text-indigo-600",
  "Terapi Metaforu": "bg-indigo-50 text-indigo-600",
  "Psiko Sanat Kitap": "bg-rose-50 text-rose-600",
};

type LatestContentListProps = {
  items: DashboardLatestContent[];
};

export function LatestContentList({ items }: LatestContentListProps) {
  return (
    <section
      aria-labelledby="latest-content-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2
          id="latest-content-heading"
          className="text-lg font-semibold text-brand-navy"
        >
          Son Eklenen İçerikler
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Platforma en son eklenen içerikler
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Henüz içerik eklenmemiş.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const Icon = typeIconMap[item.typeLabel as keyof typeof typeIconMap] ?? defaultIcon;
            const colorClass =
              typeColorMap[item.typeLabel] ?? "bg-slate-100 text-slate-600";

            return (
              <li key={item.id}>
                <Link
                  href={item.editUrl}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      colorClass
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brand-navy">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.author} · {item.typeLabel}
                    </p>
                  </div>

                  <time className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {item.date}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
