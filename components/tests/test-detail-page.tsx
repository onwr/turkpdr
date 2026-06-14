import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Play,
} from "lucide-react";

import { TestCard } from "@/components/tests/test-card";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PsychologicalTestDetail } from "@/types/test";

type TestDetailPageProps = {
  test: PsychologicalTestDetail;
  relatedTests: PsychologicalTestDetail[];
};

export function TestDetailPage({ test, relatedTests }: TestDetailPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-brand-blue">
                    Ana Sayfa
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li>
                  <Link href="/test-merkezi" className="hover:text-brand-blue">
                    Test Merkezi
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="line-clamp-1 font-medium text-brand-navy">
                  {test.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
            <div className="min-w-0 space-y-8">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">
                    {test.categoryLabel}
                  </Badge>
                  <Badge variant="outline" className="rounded-full capitalize">
                    {test.difficulty}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                  {test.title}
                </h1>

                <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                  {test.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                    <Clock className="size-4 text-brand-blue" />
                    {test.duration} dk
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                    <HelpCircle className="size-4 text-brand-blue" />
                    {test.questionCount} soru
                  </span>
                  {test.participantCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                      {new Intl.NumberFormat("tr-TR").format(
                        test.participantCount
                      )}{" "}
                      katılımcı
                    </span>
                  )}
                </div>
              </div>

              {test.iframeUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <iframe
                    src={test.iframeUrl}
                    title={test.title}
                    className="min-h-[640px] w-full"
                    loading="lazy"
                  />
                </div>
              ) : test.hasOnlineQuestions ? (
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-blue/5 to-white p-8 text-center shadow-sm sm:p-12">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                    <Play className="size-7" />
                  </div>
                  <h2 className="text-xl font-semibold text-brand-navy">
                    Teste hazırsınız
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    {test.questionCount} sorudan oluşan bu testi çevrimiçi
                    olarak çözebilir ve anında sonucunuzu görebilirsiniz.
                  </p>
                  <Button className="mt-6 rounded-xl" asChild>
                    <Link href={`/test-merkezi/${test.slug}/coz`}>
                      <Play className="size-4" />
                      Teste Başla
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center sm:p-12">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                    <Play className="size-7" />
                  </div>
                  <h2 className="text-xl font-semibold text-brand-navy">
                    Test içeriği hazırlanıyor
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Bu testin interaktif formu yakında eklenecek. Şimdilik test
                    bilgilerini inceleyebilir veya diğer testlere göz
                    atabilirsiniz.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-xl"
                    asChild
                  >
                    <Link href="/test-merkezi">
                      <ArrowLeft className="size-4" />
                      Test Merkezine Dön
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {test.image && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <Image
                    src={test.image}
                    alt={test.title}
                    fill
                    className="object-cover"
                    sizes="360px"
                    unoptimized
                  />
                </div>
              )}

              {test.hasOnlineQuestions && !test.iframeUrl && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-brand-navy">
                    Hemen Başla
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {test.questionCount} soruluk testi çözün, sonucunuzu anında
                    görün.
                  </p>
                  <Button className="mt-4 w-full rounded-xl" asChild>
                    <Link href={`/test-merkezi/${test.slug}/coz`}>
                      <Play className="size-4" />
                      Teste Başla
                    </Link>
                  </Button>
                </div>
              )}

              {relatedTests.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-brand-navy">
                    Benzer Testler
                  </h2>
                  <div className="space-y-4">
                    {relatedTests.map((related) => (
                      <TestCard key={related.id} test={related} />
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
