"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { RiverCrossingGame } from "@/components/tests/river-crossing/river-crossing-game";
import { RiverCrossingRules } from "@/components/tests/river-crossing/river-crossing-rules";

export function RiverCrossingPage() {
  return (
    <>
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
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
                Nehirden Geçirme Zeka Testi
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Nehirden Geçirme Zeka Testi
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Kurallara uyarak aile bireylerini, polisi ve hırsızı sal ile
            nehrin karşısına geçirmeye çalışın. Hamle sayınız ve süreniz
            ölçülür; en iyi skorunuz cihazınızda saklanır.
          </p>
        </header>

        <RiverCrossingRules />
        <RiverCrossingGame />
      </div>
    </>
  );
}
