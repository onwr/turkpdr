"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TestTakePageData } from "@/lib/queries/test-take";
import { RESULT_STORAGE_PREFIX } from "@/lib/test-result-storage";
import { cn } from "@/lib/utils";
import type { TestSubmitAnswer, TestSubmitResult } from "@/types/test-questions";

type TestTakePageProps = {
  slug: string;
  data: TestTakePageData;
};

export function TestTakePage({ slug, data }: TestTakePageProps) {
  const router = useRouter();
  const { test, questions } = data;
  const [answers, setAnswers] = useState<TestSubmitAnswer>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function goNext() {
    if (!currentAnswer) return;
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    if (!currentAnswer || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tests/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const responseData = (await res.json()) as TestSubmitResult & {
        error?: string;
      };
      if (!res.ok) throw new Error(responseData.error || "Test gönderilemedi.");

      sessionStorage.setItem(
        `${RESULT_STORAGE_PREFIX}${slug}`,
        JSON.stringify(responseData)
      );

      const params = new URLSearchParams();
      if (responseData.resultId) {
        params.set("id", responseData.resultId);
      }
      router.push(
        `/test-merkezi/${slug}/sonuc${params.toString() ? `?${params}` : ""}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setSubmitting(false);
    }
  }

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
                  {test.title}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-brand-navy">Çöz</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Soru {currentIndex + 1} / {questions.length}
              </span>
              <span>%{progress}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-blue transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
              {currentQuestion.text}
            </h1>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const selected = currentAnswer === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      selectOption(currentQuestion.id, option.id)
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors",
                      selected
                        ? "border-brand-blue bg-brand-blue/5 text-brand-navy"
                        : "border-slate-200 bg-white hover:border-brand-blue/40 hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                        selected
                          ? "border-brand-blue bg-brand-blue text-white"
                          : "border-slate-300"
                      )}
                    >
                      {selected && <CheckCircle2 className="size-3" />}
                    </span>
                    <span className="text-sm sm:text-base">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="size-4" />
              Önceki
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={() => void handleSubmit()}
                disabled={!currentAnswer || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Hesaplanıyor...
                  </>
                ) : (
                  <>
                    Testi Bitir
                    <CheckCircle2 className="size-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={goNext} disabled={!currentAnswer}>
                Sonraki
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
