import { TestFilterTabsClient } from "@/components/tests/test-filter-tabs-client";
import type { PsychologicalTestDetail, TestCategoryFilter } from "@/types/test";

type TestFilterTabsProps = {
  tests: PsychologicalTestDetail[];
  categories: TestCategoryFilter[];
};

export function TestFilterTabs({ tests, categories }: TestFilterTabsProps) {
  return <TestFilterTabsClient tests={tests} categories={categories} />;
}
