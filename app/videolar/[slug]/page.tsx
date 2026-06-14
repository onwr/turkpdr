import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleDetailPage } from "@/components/article/article-detail-page";
import { getCurrentUser } from "@/lib/auth";
import { getArticleInteractionState } from "@/lib/queries/interactions";
import {
  getPublishedVideoSlugs,
  getVideoPageData,
} from "@/lib/queries/videos";
import { buildArticleMetadata } from "@/lib/seo/article-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedVideoSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVideoPageData(slug);

  if (!data) {
    return { title: "Video Bulunamadı" };
  }

  const { article } = data;

  return buildArticleMetadata(article);
}

const videoSectionLinks = {
  listPath: "/videolar",
  listLabel: "Videolar",
  relatedTitle: "İlgili Videolar",
  useCategoryQuery: true,
} as const;

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const [data, user] = await Promise.all([
    getVideoPageData(slug),
    getCurrentUser(),
  ]);

  if (!data) {
    notFound();
  }

  const interaction = await getArticleInteractionState(
    data.article.id,
    user?.id
  );

  return (
    <ArticleDetailPage
      article={data.article}
      relatedArticles={data.relatedArticles}
      comments={data.comments}
      sidebar={data.sidebar}
      interaction={interaction}
      isLoggedIn={!!user}
      sectionLinks={videoSectionLinks}
    />
  );
}
