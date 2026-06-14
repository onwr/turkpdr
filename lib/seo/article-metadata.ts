import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";
import type { ArticleDetail } from "@/types/article";
import type { ResolvedSeo } from "@/types/seo";

export function buildArticleMetadata(
  article: Pick<
    ArticleDetail,
    | "seoTitle"
    | "seoDescription"
    | "ogImage"
    | "canonicalUrl"
    | "noIndex"
    | "tags"
    | "author"
    | "publishedAt"
  >
): Metadata {
  const seo: ResolvedSeo = {
    title: article.seoTitle,
    description: article.seoDescription,
    ogImage: article.ogImage,
    canonicalUrl: article.canonicalUrl,
    noIndex: article.noIndex,
  };

  return buildPageMetadata(seo, {
    keywords: article.tags,
    authors: [{ name: article.author.name }],
    type: "article",
    publishedTime: article.publishedAt,
  });
}
