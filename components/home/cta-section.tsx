import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteContainerClass, siteSectionClass } from "@/lib/site-layout";

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className={siteSectionClass}
    >
      <div className={siteContainerClass}>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-blue via-blue-600 to-sky-500 px-6 py-14 text-center shadow-xl shadow-brand-blue/25 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl space-y-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Sparkles className="size-7 text-white" />
            </div>

            <h2
              id="cta-heading"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
            >
              TürkPDR Topluluğuna Katıl
            </h2>

            <p className="text-base text-white/85 sm:text-lg">
              Binlerce uzman, öğretmen ve öğrenciyle birlikte bilgi paylaşın,
              testlere erişin ve profesyonel gelişiminizi destekleyin.
            </p>

            <Button
              size="lg"
              className="h-12 rounded-2xl bg-white px-8 text-base font-semibold text-brand-blue shadow-lg hover:bg-white/90"
              asChild
            >
              <Link href="/kayit">
                Ücretsiz Üye Ol
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
