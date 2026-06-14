"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ChevronRight } from "lucide-react";

import { ReflexGame } from "@/components/tests/reflex/reflex-game";
import { ReflexInfoCard } from "@/components/tests/reflex/reflex-info-card";
import {
  ReflexScoreCard,
  type ReflexGameStatus,
} from "@/components/tests/reflex/reflex-score-card";
import { REFLEX_BEST_SCORE_KEY } from "@/lib/special-tests";

function readBestScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(REFLEX_BEST_SCORE_KEY);
  const parsed = raw ? Number.parseFloat(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeBestScore(score: number) {
  window.localStorage.setItem(REFLEX_BEST_SCORE_KEY, score.toString());
}

export function ReflexTestContent() {
  const [status, setStatus] = useState<ReflexGameStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [bestScore, setBestScore] = useState(readBestScore);
  const [resetToken, setResetToken] = useState(0);

  const handleStart = useCallback(() => {
    setElapsed(0);
    setResetToken((value) => value + 1);
    setStatus("playing");
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setBestScore((currentBest) => {
      if (finalScore > currentBest) {
        writeBestScore(finalScore);
        return finalScore;
      }
      return currentBest;
    });
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
                Kırmızı Kare Refleks Testi
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Kırmızı Kare Refleks Testi
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Dikkatini, refleksini ve odaklanma süreni ölçen kısa bir beceri
            testi.
          </p>
        </header>

        <ReflexScoreCard
          elapsed={elapsed}
          bestScore={bestScore}
          status={status}
          onStart={handleStart}
        />

        <ReflexGame
          status={status}
          resetToken={resetToken}
          onStatusChange={setStatus}
          onElapsedChange={setElapsed}
          onGameOver={handleGameOver}
        />

        <ReflexInfoCard />
      </div>
    </>
  );
}
