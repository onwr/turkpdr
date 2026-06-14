import {
  AlertCircle,
  BookOpen,
  FileText,
  Newspaper,
  Users,
  Video,
} from "lucide-react";

import type { AdminStat } from "@/types/admin";
import { cn } from "@/lib/utils";

const iconMap = {
  members: Users,
  articles: BookOpen,
  news: Newspaper,
  files: FileText,
  videos: Video,
  pending: AlertCircle,
} as const;

const colorMap = {
  members: "bg-blue-50 text-brand-blue",
  articles: "bg-indigo-50 text-indigo-600",
  news: "bg-sky-50 text-sky-600",
  files: "bg-amber-50 text-amber-600",
  videos: "bg-violet-50 text-violet-600",
  pending: "bg-orange-50 text-orange-600",
} as const;

function formatValue(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

type AdminStatCardProps = {
  stat: AdminStat;
};

export function AdminStatCard({ stat }: AdminStatCardProps) {
  const Icon = iconMap[stat.icon];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            colorMap[stat.icon]
          )}
        >
          <Icon className="size-5" />
        </div>
        {stat.change && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
            {stat.change}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-brand-navy">
        {formatValue(stat.value)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
    </article>
  );
}
