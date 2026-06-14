"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, HelpCircle, Play } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { Button } from "@/components/ui/button";
import { testCategories } from "@/lib/mock-data/tests";
import { siteContainerClass, siteSectionClass } from "@/lib/site-layout";
import type { PsychologicalTest, TestCategory } from "@/types/home";
import { cn } from "@/lib/utils";

function TestCard({ test }: { test: PsychologicalTest }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/60 bg-white p-6 shadow-sm shadow-brand-navy/5 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md hover:shadow-brand-blue/10 dark:bg-card dark:shadow-none">
      <h3 className="text-lg font-semibold text-brand-navy dark:text-foreground">
        {test.title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-muted">
          <Clock className="size-4 text-brand-blue" />
          {test.duration} dk
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-muted">
          <HelpCircle className="size-4 text-brand-blue" />
          {test.questionCount} soru
        </span>
      </div>

      <Button
        className="mt-6 w-full rounded-xl bg-brand-blue text-white shadow-md shadow-brand-blue/20 hover:bg-brand-blue/90"
        asChild
      >
        <Link href={`/test-merkezi/${test.slug}`}>
          <Play className="size-4" />
          Başlat
        </Link>
      </Button>
    </article>
  );
}

type TestCenterSectionProps = {
  tests: PsychologicalTest[];
};

export function TestCenterSection({ tests }: TestCenterSectionProps) {
  const [activeCategory, setActiveCategory] = useState<TestCategory | "all">(
    "all"
  );

  const filteredTests = useMemo(() => {
    if (activeCategory === "all") {
      return tests.slice(0, 4);
    }
    return tests.filter((test) => test.category === activeCategory);
  }, [activeCategory, tests]);

  return (
    <section
      aria-labelledby="test-center-heading"
      className={`bg-slate-50/80 dark:bg-muted/30 ${siteSectionClass}`}
    >
      <div className={siteContainerClass}>
        <SectionHeader
          title="Test Merkezi"
          description="Çocuk, ergen, yetişkin ve klinik alanlarda güvenilir psikolojik testlere anında erişin."
          href="/test-merkezi"
        />

        <div
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Test kategorileri"
        >
          {testCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                activeCategory === category.id
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                  : "border border-border/60 bg-white text-brand-navy hover:border-brand-blue/30 hover:text-brand-blue dark:bg-card dark:text-foreground"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {tests.length === 0 ? (
          <EmptyState
            title="Henüz test yok"
            description="Yayınlanmış psikolojik test bulunmuyor. Yakında yeni testler eklenecek."
          />
        ) : filteredTests.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <p className="col-span-full rounded-2xl border border-dashed border-border bg-white p-8 text-center text-muted-foreground dark:bg-card">
            Bu kategoride henüz test bulunmuyor.
          </p>
        )}
      </div>
    </section>
  );
}
