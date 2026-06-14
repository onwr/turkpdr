import Link from "next/link";
import { ArrowRight, ClipboardList, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatCount(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

type TestHeroProps = {
  totalTests: number;
  totalParticipants: number;
};

export function TestHero({ totalTests, totalParticipants }: TestHeroProps) {
  return (
    <section
      aria-labelledby="test-hero-heading"
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-blue/10 via-sky-50 to-white px-6 py-12 shadow-sm sm:px-10 sm:py-16 lg:px-14"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 size-60 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-lg shadow-brand-blue/25">
          <ClipboardList className="size-7" />
        </div>

        <h1
          id="test-hero-heading"
          className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl"
        >
          Psikolojik{" "}
          <span className="bg-gradient-to-r from-brand-blue to-sky-500 bg-clip-text text-transparent">
            Test Merkezi
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Bilimsel geçerliliği kanıtlanmış psikolojik testlere ücretsiz erişin.
          Depresyon, kaygı, özgüven, mesleki yönelim ve daha fazlasını
          değerlendirin.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 rounded-2xl bg-brand-blue px-6 shadow-lg shadow-brand-blue/25 hover:bg-brand-blue/90"
            asChild
          >
            <a href="#testler">
              Testlere Göz At
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-2xl border-slate-200"
            asChild
          >
            <Link href="/kayit">Ücretsiz Üye Ol</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Shield className="size-4 text-brand-blue" />
            Bilimsel geçerlilik
          </span>
          <span>{formatCount(totalTests)} test</span>
          {totalParticipants > 0 && (
            <span>{formatCount(totalParticipants)} katılımcı</span>
          )}
        </div>
      </div>
    </section>
  );
}
