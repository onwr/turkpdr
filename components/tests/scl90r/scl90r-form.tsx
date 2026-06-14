"use client";

import { AlertCircle, Calculator, RotateCcw } from "lucide-react";

import { Scl90rQuestionCard } from "@/components/tests/scl90r/scl90r-question-card";
import {
  SCL90_QUESTIONS,
  countAnswered,
  getMissingCount,
  isComplete,
  saveAnswers,
  type ScoreValue,
  type Scl90Answers,
} from "@/components/tests/scl90r/scl90r-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Scl90rFormProps = {
  answers: Scl90Answers;
  onAnswersChange: (answers: Scl90Answers) => void;
  onCalculate: () => void;
  onClear: () => void;
};

export function Scl90rForm({
  answers,
  onAnswersChange,
  onCalculate,
  onClear,
}: Scl90rFormProps) {
  const answered = countAnswered(answers);
  const missing = getMissingCount(answers);
  const complete = isComplete(answers);
  const progress = (answered / 90) * 100;

  const handleChange = (questionId: number, value: ScoreValue) => {
    const next = { ...answers, [questionId]: value };
    onAnswersChange(next);
    saveAnswers(next);
  };

  return (
    <div className="space-y-6">
      <Card className="sticky top-24 z-20 mt-2 rounded-2xl border-slate-200 shadow-md shadow-slate-200/50 lg:top-40">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-navy">
                İlerleme: {answered} / 90 soru
              </p>
              <p className="text-xs text-muted-foreground">
                {complete
                  ? "Tüm sorular cevaplandı."
                  : `${missing} soru eksik`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={onClear}>
                <RotateCcw className="size-4" />
                Tümünü Temizle
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
                disabled={!complete}
                onClick={onCalculate}
              >
                <Calculator className="size-4" />
                Sonucu Hesapla
              </Button>
            </div>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-blue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {!complete && missing > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                Sonucu hesaplamak için {missing} soruyu daha cevaplamanız
                gerekiyor.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {SCL90_QUESTIONS.map((text, index) => {
          const questionId = index + 1;
          return (
            <Scl90rQuestionCard
              key={questionId}
              index={questionId}
              text={text}
              value={answers[questionId]}
              onChange={(value) => handleChange(questionId, value)}
            />
          );
        })}
      </div>

      <Card className="rounded-2xl border-slate-200">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-muted-foreground">
            {complete
              ? "Tüm soruları tamamladınız. Sonucu hesaplayabilirsiniz."
              : `${missing} soru eksik — lütfen tüm maddeleri puanlayın.`}
          </p>
          <Button
            className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
            disabled={!complete}
            onClick={onCalculate}
          >
            <Calculator className="size-4" />
            Sonucu Hesapla
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
