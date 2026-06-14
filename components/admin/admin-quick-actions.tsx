import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileUp,
  Newspaper,
  PenLine,
} from "lucide-react";

import { quickActions as defaultQuickActions } from "@/lib/admin/nav";
import type { QuickAction } from "@/types/admin";
import { cn } from "@/lib/utils";

const iconMap = {
  article: PenLine,
  news: Newspaper,
  file: FileUp,
  test: ClipboardList,
  dictionary: BookOpen,
} as const;

const colorMap = {
  article:
    "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
  news: "bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
  file: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
  test: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  dictionary:
    "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
} as const;

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = iconMap[action.icon];

  return (
    <Link
      href={action.href}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md sm:p-5"
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
          colorMap[action.icon]
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-brand-navy">{action.label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {action.description}
        </p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-blue" />
    </Link>
  );
}

type AdminQuickActionsProps = {
  actions?: QuickAction[];
};

export function AdminQuickActions({
  actions = defaultQuickActions,
}: AdminQuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-heading">
      <div className="mb-4">
        <h2
          id="quick-actions-heading"
          className="text-lg font-semibold text-brand-navy"
        >
          Hızlı İşlemler
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Sık kullanılan yönetim işlemlerine hızlı erişim
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}
