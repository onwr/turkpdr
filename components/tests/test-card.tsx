import Link from "next/link";
import { Clock, HelpCircle, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTestStartHref } from "@/lib/special-tests";
import type { PsychologicalTestDetail } from "@/types/test";
import { cn } from "@/lib/utils";

const difficultyStyles = {
  kolay: "bg-emerald-50 text-emerald-700",
  orta: "bg-amber-50 text-amber-700",
  zor: "bg-red-50 text-red-700",
} as const;

type TestCardProps = {
  test: PsychologicalTestDetail;
};

export function TestCard({ test }: TestCardProps) {
  const startHref = getTestStartHref(test);

  return (
    <Card className="group flex flex-col transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md hover:shadow-brand-blue/10">
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-brand-blue/10 text-brand-blue"
          >
            {test.categoryLabel}
          </Badge>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
              difficultyStyles[test.difficulty]
            )}
          >
            {test.difficulty}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-brand-navy transition-colors group-hover:text-brand-blue">
          {test.title}
        </h3>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {test.description}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
            <Clock className="size-3.5 text-brand-blue" />
            {test.duration} dk
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
            <HelpCircle className="size-3.5 text-brand-blue" />
            {test.isSpecial && test.questionCount === 0
              ? "İnteraktif"
              : `${test.questionCount} soru`}
          </span>
        </div>

        <Button
          className="mt-auto w-full rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20 hover:bg-brand-blue/90"
          asChild
        >
          <Link href={startHref}>
            <Play className="size-4" />
            Teste Başla
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
