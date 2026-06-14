import {
  BookOpen,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";

import type { StatItem } from "@/types/home";
import { siteContainerClass, siteSectionCompactClass } from "@/lib/site-layout";

const iconMap = {
  articles: BookOpen,
  tests: ClipboardList,
  members: Users,
  files: FileText,
} as const;

function formatStatValue(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = iconMap[stat.icon];

  return (
    <article className="group rounded-2xl border border-border/60 bg-white p-6 shadow-sm shadow-brand-navy/5 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md hover:shadow-brand-blue/10 dark:bg-card dark:shadow-none dark:hover:border-brand-blue/30">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl dark:text-foreground">
        {formatStatValue(stat.value)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
    </article>
  );
}

type StatsSectionProps = {
  stats: StatItem[];
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section
      aria-labelledby="stats-heading"
      className={`border-y border-border/60 bg-slate-50/80 dark:bg-muted/30 ${siteSectionCompactClass}`}
    >
      <div className={siteContainerClass}>
        <h2 id="stats-heading" className="sr-only">
          Platform İstatistikleri
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
