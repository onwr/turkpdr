"use client";

import {
  SCORE_OPTIONS,
  type ScoreValue,
} from "@/components/tests/scl90r/scl90r-utils";
import { cn } from "@/lib/utils";

type Scl90rQuestionCardProps = {
  index: number;
  text: string;
  value?: ScoreValue;
  onChange: (value: ScoreValue) => void;
};

export function Scl90rQuestionCard({
  index,
  text,
  value,
  onChange,
}: Scl90rQuestionCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm transition-colors sm:p-5",
        value === undefined
          ? "border-slate-200"
          : "border-brand-blue/30 shadow-brand-blue/5"
      )}
    >
      <div className="mb-4 flex gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-sm font-semibold text-brand-blue">
          {index}
        </span>
        <p className="pt-1 text-sm leading-relaxed text-brand-navy sm:text-base">
          {text}
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-5"
        role="radiogroup"
        aria-label={`Soru ${index} puanlama`}
      >
        {SCORE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border px-2 py-2.5 text-center text-xs transition-colors sm:px-3 sm:text-sm",
                selected
                  ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-blue/40 hover:bg-brand-blue/5"
              )}
            >
              <span className="block font-semibold">{option.value}</span>
              <span className="mt-0.5 block leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
