"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RESULT_STORAGE_PREFIX } from "@/lib/test-result-storage";
import type { TestSubmitResult } from "@/types/test-questions";

type TestResultPageProps = {
  slug: string;
};

type ResultData = {
  totalScore: number;
  maxScore: number;
  resultLabel: string;
  resultDescription: string;
  testTitle: string;
  testSlug: string;
  resultId?: string | null;
};

export function TestResultPage({ slug }: TestResultPageProps) {
  const searchParams = useSearchParams();
  const resultId = searchParams.get("id") ?? searchParams.get("resultId");

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      setLoading(true);
      setError(null);

      try {
        if (resultId) {
          const res = await fetch(`/api/tests/results/${resultId}`);
          const data = await res.json();

          if (res.ok) {
            setResult({
              totalScore: data.result.totalScore,
              maxScore: data.result.maxScore,
              resultLabel: data.result.resultLabel,
              resultDescription: data.result.resultDescription,
              testTitle: data.result.testTitle,
              testSlug: data.result.testSlug,
              resultId: data.result.id,
            });
            return;
          }

          if (res.status === 401) {
            setError("Bu sonucu görüntülemek için giriş yapmalısınız.");
            return;
          }

          if (res.status === 404) {
            setError(data.error ?? "Sonuç bulunamadı.");
            return;
          }
        }

        const stored = sessionStorage.getItem(
          `${RESULT_STORAGE_PREFIX}${slug}`
        );

        if (stored) {
          const parsed = JSON.parse(stored) as TestSubmitResult;
          if (parsed.testSlug === slug) {
            setResult(parsed);
            return;
          }
        }

        setError("Sonuç bulunamadı. Lütfen testi yeniden çözün.");
      } catch {
        setError("Sonuç yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    void loadResult();
  }, [resultId, slug]);

  const percent =
    result && result.maxScore > 0
      ? Math.round((result.totalScore / result.maxScore) * 100)
      : 0;

  return (
    <main className="min-h-[70vh] bg-white">
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/test-merkezi" className="hover:text-brand-blue">
                    Test Merkezi
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li>
                  <Link
                    href={`/test-merkezi/${slug}`}
                    className="hover:text-brand-blue"
                  >
                    {result?.testTitle ?? "Test"}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="font-medium text-brand-navy">Sonuç</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-brand-blue" />
              <p>Sonuç yükleniyor...</p>
            </div>
          ) : error || !result ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-muted-foreground">
                {error ?? "Sonuç bulunamadı."}
              </p>
              <Button className="mt-6" asChild>
                <Link href={`/test-merkezi/${slug}/coz`}>
                  <RotateCcw className="size-4" />
                  Testi Tekrar Çöz
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-blue/5 to-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                  <BarChart3 className="size-8" />
                </div>
                <p className="text-sm font-medium uppercase tracking-wide text-brand-blue">
                  Test Sonucunuz
                </p>
                <h1 className="mt-2 text-3xl font-bold text-brand-navy">
                  {result.resultLabel}
                </h1>
                <p className="mt-4 text-4xl font-bold text-brand-navy">
                  {result.totalScore}
                  <span className="text-lg font-normal text-muted-foreground">
                    {" "}
                    / {result.maxScore} puan
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Başarı oranı: %{percent}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-navy">
                  Değerlendirme
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {result.resultDescription}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Bu sonuç yalnızca bilgilendirme amaçlıdır ve profesyonel
                  tanı veya tedavi yerine geçmez.
                </p>
              </div>

              {result.resultId && (
                <p className="text-center text-sm text-muted-foreground">
                  Sonucunuz hesabınıza kaydedildi.
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/test-merkezi/${slug}`}>
                    <ArrowLeft className="size-4" />
                    Test Detayına Dön
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/test-merkezi/${slug}/coz`}>
                    <RotateCcw className="size-4" />
                    Tekrar Çöz
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
