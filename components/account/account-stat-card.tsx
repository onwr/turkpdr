import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AccountStatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  accent?: "blue" | "amber" | "emerald" | "violet" | "rose" | "slate";
};

const accentStyles = {
  blue: "bg-brand-blue/10 text-brand-blue",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
};

export function AccountStatCard({
  label,
  value,
  icon: Icon,
  href,
  accent = "blue",
}: AccountStatCardProps) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all hover:border-brand-blue/20 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            accentStyles[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}
