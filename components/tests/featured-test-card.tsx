import Link from "next/link";
import {
  BarChart3,
  Clock,
  HelpCircle,
  Play,
  Star,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTestStartHref } from "@/lib/special-tests";
import type { PsychologicalTestDetail } from "@/types/test";

function formatParticipants(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

type FeaturedTestCardProps = {
  test: PsychologicalTestDetail;
};

export function FeaturedTestCard({ test }: FeaturedTestCardProps) {
  const startHref = getTestStartHref(test);

  return (
    <section
      aria-labelledby="featured-test-heading"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50"
    >
      <div className="grid lg:grid-cols-2">
        <div className="relative flex items-center justify-center bg-gradient-to-br from-brand-blue via-blue-600 to-sky-500 p-8 sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />
          <div className="relative text-center text-white">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Star className="size-8 fill-current" />
            </div>
            <p className="text-sm font-medium text-white/80">Öne Çıkan Test</p>
            <p className="mt-2 text-3xl font-bold sm:text-4xl">{test.title}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">
              {test.categoryLabel}
            </Badge>
            <Badge variant="outline" className="rounded-full capitalize">
              {test.difficulty}
            </Badge>
          </div>

          <h2
            id="featured-test-heading"
            className="text-2xl font-bold text-brand-navy"
          >
            {test.title}
          </h2>

          <p className="leading-relaxed text-muted-foreground">
            {test.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-brand-blue" />
              {test.duration} dk
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HelpCircle className="size-4 text-brand-blue" />
              {test.questionCount} soru
            </span>
            {test.participantCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-brand-blue" />
                {formatParticipants(test.participantCount)} katılımcı
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-4 text-brand-blue" />
              Zorluk: {test.difficulty}
            </span>
          </div>

          <Button
            size="lg"
            className="w-fit rounded-2xl bg-brand-blue shadow-md shadow-brand-blue/25 hover:bg-brand-blue/90"
            asChild
          >
            <Link href={startHref}>
              <Play className="size-4" />
              Teste Başla
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
