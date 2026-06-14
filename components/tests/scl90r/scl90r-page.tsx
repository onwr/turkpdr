"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ChevronRight } from "lucide-react";

import { Scl90rForm } from "@/components/tests/scl90r/scl90r-form";
import { Scl90rInfoCard } from "@/components/tests/scl90r/scl90r-info-card";
import { Scl90rResultView } from "@/components/tests/scl90r/scl90r-result";
import {
  calculateScl90Result,
  clearScl90Storage,
  loadAnswers,
  loadResult,
  saveResult,
  type Scl90Answers,
  type Scl90Result,
} from "@/components/tests/scl90r/scl90r-utils";

type ViewMode = "form" | "result";

function getInitialState(): {
  answers: Scl90Answers;
  result: Scl90Result | null;
  view: ViewMode;
} {
  const answers = loadAnswers();
  const result = loadResult();
  return {
    answers,
    result,
    view: result ? "result" : "form",
  };
}

export function Scl90rPage() {
  const [answers, setAnswers] = useState<Scl90Answers>(
    () => getInitialState().answers
  );
  const [result, setResult] = useState<Scl90Result | null>(
    () => getInitialState().result
  );
  const [view, setView] = useState<ViewMode>(() => getInitialState().view);

  const handleCalculate = useCallback(() => {
    const computed = calculateScl90Result(answers);
    setResult(computed);
    saveResult(computed);
    setView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [answers]);

  const handleClear = useCallback(() => {
    setAnswers({});
    clearScl90Storage();
    setResult(null);
    setView("form");
  }, []);

  const handleRetake = useCallback(() => {
    setAnswers({});
    clearScl90Storage();
    setResult(null);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
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
              <li className="font-medium text-brand-navy">
                SCL90-R Psikolojik Belirti Taraması
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            SCL90-R Psikolojik Belirti Taraması
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Psikolojik belirti düzeylerini değerlendirmeye yardımcı tarama
            ölçeği. Son üç ay içindeki deneyimlerinizi 0–4 arası puanlayın.
          </p>
        </header>

        <Scl90rInfoCard />

        {view === "form" ? (
          <Scl90rForm
            answers={answers}
            onAnswersChange={setAnswers}
            onCalculate={handleCalculate}
            onClear={handleClear}
          />
        ) : result ? (
          <Scl90rResultView result={result} onRetake={handleRetake} />
        ) : null}
      </div>
    </>
  );
}
