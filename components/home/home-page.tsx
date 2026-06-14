import { AuthorsSection } from "@/components/home/authors-section";
import { CtaSection } from "@/components/home/cta-section";
import { FeaturedArticlesSection } from "@/components/home/featured-articles-section";
import { FileCenterSection } from "@/components/home/file-center-section";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { HeroSection } from "@/components/home/hero-section";
import { LatestNewsSection } from "@/components/home/latest-news-section";
import { StatsSection } from "@/components/home/stats-section";
import { TestCenterSection } from "@/components/home/test-center-section";
import type {
  Article,
  Author,
  FileItem,
  NewsItem,
  PsychologicalTest,
  StatItem,
} from "@/types/home";

export type HomePageData = {
  featuredArticles: Article[];
  latestNews: NewsItem[];
  authors: Author[];
  tests: PsychologicalTest[];
  files: FileItem[];
  stats: StatItem[];
};

type HomePageProps = {
  data: HomePageData;
};

export function HomePage({ data }: HomePageProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <StatsSection stats={data.stats} />
        <FeaturedArticlesSection articles={data.featuredArticles} />
        <TestCenterSection tests={data.tests} />
        <FileCenterSection files={data.files} />
        <AuthorsSection authors={data.authors} />
        <LatestNewsSection news={data.latestNews} />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
