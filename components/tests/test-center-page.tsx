import { EmptyState } from "@/components/shared/empty-state";
import { FeaturedTestCard } from "@/components/tests/featured-test-card";
import { PopularTests } from "@/components/tests/popular-tests";
import { TestFaq } from "@/components/tests/test-faq";
import { TestFilterTabs } from "@/components/tests/test-filter-tabs";
import { TestHero } from "@/components/tests/test-hero";
import { TestInfoSection } from "@/components/tests/test-info-section";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import type {
  PsychologicalTestDetail,
  TestCategoryFilter,
} from "@/types/test";

export type TestCenterPageData = {
  allTests: PsychologicalTestDetail[];
  featuredTest: PsychologicalTestDetail | null;
  popularTests: PsychologicalTestDetail[];
  categories: TestCategoryFilter[];
  totalParticipants: number;
  totalTests: number;
};

type TestCenterPageProps = {
  data: TestCenterPageData;
};

export function TestCenterPage({ data }: TestCenterPageProps) {
  const {
    allTests,
    featuredTest,
    popularTests,
    categories,
    totalParticipants,
    totalTests,
  } = data;

  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <div className="bg-gradient-to-b from-sky-50/80 via-white to-white">
          <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <TestHero
              totalTests={totalTests}
              totalParticipants={totalParticipants}
            />

            {featuredTest ? (
              <FeaturedTestCard test={featuredTest} />
            ) : allTests.length === 0 ? (
              <EmptyState
                title="Henüz test yok"
                description="Yayınlanmış psikolojik test bulunmuyor. Yakında yeni testler eklenecek."
              />
            ) : null}

            <PopularTests tests={popularTests} />

            <TestFilterTabs tests={allTests} categories={categories} />

            <TestInfoSection />

            <TestFaq />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
