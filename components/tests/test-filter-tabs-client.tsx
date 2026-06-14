"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { TestCard } from "@/components/tests/test-card";
import type { PsychologicalTestDetail, TestCategoryFilter } from "@/types/test";
import type { TestCategory } from "@/types/test";
import { cn } from "@/lib/utils";

type TestFilterTabsClientProps = {
  tests: PsychologicalTestDetail[];
  categories: TestCategoryFilter[];
};

export function TestFilterTabsClient({
  tests,
  categories,
}: TestFilterTabsClientProps) {
  const [activeCategory, setActiveCategory] = useState<TestCategory | "all">(
    "all"
  );

  const filteredTests = useMemo(() => {
    if (activeCategory === "all") return tests;
    return tests.filter((t) => t.category === activeCategory);
  }, [activeCategory, tests]);

  return (
    <section id="testler" aria-labelledby="tests-heading" className="space-y-6">
      <div>
        <h2
          id="tests-heading"
          className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl"
        >
          Tüm Testler
        </h2>
        <p className="mt-2 text-muted-foreground">
          Kategoriye göre filtreleyerek size uygun testi bulun
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Test kategorileri"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              activeCategory === category.id
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                : "border border-slate-200 bg-white text-brand-navy hover:border-brand-blue/30 hover:text-brand-blue"
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-muted-foreground">
          Bu kategoride henüz test bulunmuyor.
        </p>
      )}
    </section>
  );
}
