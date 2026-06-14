import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ArticleActions } from "@/components/article/article-actions";
import { ArticleAuthorBox } from "@/components/article/article-author-box";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleHero } from "@/components/article/article-hero";
import { ArticleSidebar } from "@/components/article/article-sidebar";
import { CommentsSection } from "@/components/article/comments-section";
import { RelatedArticles } from "@/components/article/related-articles";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import type {
  ArticleCategory,
  ArticleComment,
  ArticleDetail,
  PopularArticle,
  RelatedArticle,
} from "@/types/article";
import type { ArticleInteractionState } from "@/lib/queries/interactions";

export type SectionLinks = {
  listPath: string;
  listLabel: string;
  relatedTitle?: string;
  useCategoryQuery?: boolean;
};

type ArticleDetailPageProps = {
  article: ArticleDetail;
  relatedArticles: RelatedArticle[];
  comments: ArticleComment[];
  sidebar: {
    popularArticles: PopularArticle[];
    articleCategories: ArticleCategory[];
  };
  interaction: ArticleInteractionState;
  isLoggedIn: boolean;
  sectionLinks?: SectionLinks;
};

const defaultSectionLinks: SectionLinks = {
  listPath: "/makaleler",
  listLabel: "Makaleler",
  relatedTitle: "İlgili Makaleler",
  useCategoryQuery: false,
};

export function ArticleDetailPage({
  article,
  relatedArticles,
  comments,
  sidebar,
  interaction,
  isLoggedIn,
  sectionLinks = defaultSectionLinks,
}: ArticleDetailPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
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
                  <Link
                    href={sectionLinks.listPath}
                    className="hover:text-brand-blue"
                  >
                    {sectionLinks.listLabel}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li>
                  <Link
                    href={`${sectionLinks.listPath}/kategori/${article.categorySlug}`}
                    className="hover:text-brand-blue"
                  >
                    {article.category}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="line-clamp-1 font-medium text-brand-navy">
                  {article.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-12 xl:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-8">
              <ArticleHero article={article} />
              <ArticleActions
                contentId={article.id}
                title={article.title}
                initialLikeCount={article.likeCount}
                initialLiked={interaction.liked}
                initialFavorited={interaction.favorited}
                isLoggedIn={isLoggedIn}
              />
              <ArticleContent article={article} />
              <ArticleAuthorBox author={article.author} />
              <RelatedArticles
                articles={relatedArticles}
                basePath={sectionLinks.listPath}
                listPath={sectionLinks.listPath}
                title={sectionLinks.relatedTitle}
              />
              <CommentsSection
                contentId={article.id}
                initialComments={comments}
                isLoggedIn={isLoggedIn}
              />
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <ArticleSidebar
                popularArticles={sidebar.popularArticles}
                articleCategories={sidebar.articleCategories}
                basePath={sectionLinks.listPath}
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
