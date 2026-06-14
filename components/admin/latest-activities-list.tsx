import Link from "next/link";
import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ActivityLogItem } from "@/types/activity";

type LatestActivitiesListProps = {
  activities: ActivityLogItem[];
};

export function LatestActivitiesList({ activities }: LatestActivitiesListProps) {
  return (
    <section
      aria-labelledby="latest-activities-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2
            id="latest-activities-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            Son Aktiviteler
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Sistemdeki son önemli işlemler
          </p>
        </div>
        <Link
          href="/admin/activity"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Tümü
        </Link>
      </div>

      {activities.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Henüz aktivite kaydı bulunmuyor.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {activities.map((item) => (
            <li key={item.id} className="px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <History className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-xs text-muted-foreground">
                      {item.createdAtLabel}
                    </time>
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-slate-100 text-[11px] text-brand-navy"
                    >
                      {item.action}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-brand-navy">
                    {item.user?.name ?? "Sistem"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
