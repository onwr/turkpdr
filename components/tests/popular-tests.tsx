import Link from "next/link";
import { Flame, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTestStartHref } from "@/lib/special-tests";
import type { PsychologicalTestDetail } from "@/types/test";

function formatParticipants(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

type PopularTestsProps = {
  tests: PsychologicalTestDetail[];
};

export function PopularTests({ tests }: PopularTestsProps) {
  if (tests.length === 0) return null;

  return (
    <section aria-labelledby="popular-tests-heading" className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2
            id="popular-tests-heading"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight text-brand-navy"
          >
            <Flame className="size-6 text-orange-500" />
            Popüler Testler
          </h2>
          <p className="mt-2 text-muted-foreground">
            En çok çözülen psikolojik testler
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tests.map((test, index) => (
          <article
            key={test.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition-all hover:border-brand-blue/20 hover:shadow-md"
          >
            <span className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-lg bg-brand-blue/10 text-xs font-bold text-brand-blue">
              {index + 1}
            </span>

            <Badge
              variant="secondary"
              className="mb-3 rounded-full bg-slate-100 text-slate-600"
            >
              {test.categoryLabel}
            </Badge>

            <h3 className="pr-8 font-semibold text-brand-navy transition-colors group-hover:text-brand-blue">
              {test.title}
            </h3>

            <p className="mt-2 text-xs text-muted-foreground">
              {test.participantCount > 0 && (
                <>
                  {formatParticipants(test.participantCount)} katılımcı
                  {" · "}
                </>
              )}
              {test.duration} dk
            </p>

            <Button
              size="sm"
              variant="outline"
              className="mt-4 w-full rounded-xl group-hover:border-brand-blue group-hover:text-brand-blue"
              asChild
            >
              <Link href={getTestStartHref(test)}>
                <Play className="size-3.5" />
                Başlat
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
