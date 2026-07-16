import type { ContentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  contentDetailInclude,
  contentListInclude,
  DEFAULT_AVATAR,
  DEFAULT_COVER_IMAGE,
  getPublicContentWhere,
} from "@/lib/queries/constants";
import {
  estimateReadTime,
  formatDateTR,
} from "@/lib/queries/format";
import { sanitizeHtml } from "@/lib/sanitize-html";
import {
  resolveMediaUrlWithFallback,
  resolveRichTextMediaUrls,
} from "@/lib/media-url";
import { resolveContentSeo } from "@/lib/seo/metadata";
import type {
  ArticleCategory,
  ArticleComment,
  ArticleDetail,
  PopularArticle,
  RelatedArticle,
} from "@/types/article";
import type { Article } from "@/types/home";
import type { NewsItem } from "@/types/home";

const ARTICLE_TYPES: ContentType[] = [
  "ARTICLE",
  "GUIDE",
  "METAPHOR",
];

function mapToArticleDetail(content: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  views: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    title: string | null;
    avatar: string | null;
    bio: string | null;
    createdAt: Date;
  };
  category: { name: string; slug: string } | null;
  tags: { tag: { name: string } }[];
  _count: { likes: number; comments: number };
}): ArticleDetail {
  const publishedAt = content.publishedAt ?? content.createdAt;
  const htmlContent = content.content ?? "";
  const seo = resolveContentSeo(
    {
      title: content.title,
      slug: content.slug,
      summary: content.summary,
      coverImage: content.coverImage,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      ogImage: content.ogImage,
      canonicalUrl: content.canonicalUrl,
      noIndex: content.noIndex,
    },
    "/makaleler",
    " | TürkPDR"
  );

  return {
    id: content.id,
    slug: content.slug,
    title: content.title,
    excerpt: content.summary ?? "",
    category: content.category?.name ?? "Genel",
    categorySlug: content.category?.slug ?? "genel",
    author: {
      name: content.author.name,
      title: content.author.title ?? "Yazar",
      avatar: resolveMediaUrlWithFallback(
        content.author.avatar,
        DEFAULT_AVATAR
      ),
      bio: content.author.bio ?? "",
      slug: content.author.id,
      articleCount: 0,
    },
    date: formatDateTR(publishedAt),
    publishedAt: publishedAt.toISOString(),
    readTime: estimateReadTime(htmlContent),
    coverImage: resolveMediaUrlWithFallback(
      content.coverImage,
      DEFAULT_COVER_IMAGE
    ),
    content: resolveRichTextMediaUrls(sanitizeHtml(htmlContent)),
    likeCount: content._count.likes,
    seoTitle: seo.title,
    seoDescription: seo.description,
    ogImage: seo.ogImage,
    canonicalUrl: seo.canonicalUrl,
    noIndex: seo.noIndex,
    tags: content.tags.map((t) => t.tag.name),
  };
}

export async function getPublishedContentSlugs(): Promise<string[]> {
  const contents = await prisma.content.findMany({
    where: { ...getPublicContentWhere(), type: { in: ARTICLE_TYPES } },
    select: { slug: true },
  });
  return contents.map((c) => c.slug);
}

/** Shared view counter for the Content model (news, articles, videos, psiko-sanat). */
export async function incrementContentViews(id: string) {
  return prisma.content.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleDetail | null> {
  const content = await prisma.content.findFirst({
    where: { slug, ...getPublicContentWhere(), type: { in: ARTICLE_TYPES } },
    include: {
      ...contentDetailInclude,
      author: {
        select: {
          id: true,
          name: true,
          title: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              contents: { where: getPublicContentWhere() },
            },
          },
        },
      },
    },
  });

  if (!content) return null;

  const detail = mapToArticleDetail(content);
  detail.author.articleCount = content.author._count.contents;
  return detail;
}

export async function getRelatedArticles(
  slug: string,
  categoryId: string | null,
  limit = 3
): Promise<RelatedArticle[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      slug: { not: slug },
      ...(categoryId ? { categoryId } : {}),
    },
    include: contentListInclude,
    orderBy: { views: "desc" },
    take: limit,
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Genel",
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
    readTime: estimateReadTime(c.content),
  }));
}

export async function getArticleComments(
  postId: string
): Promise<ArticleComment[]> {
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: { select: { name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return comments.map((c) => ({
    id: c.id,
    author: c.user.name,
    avatar: resolveMediaUrlWithFallback(c.user.avatar, DEFAULT_AVATAR),
    date: formatDateTR(c.createdAt),
    content: c.content,
  }));
}

export async function getPopularArticles(
  excludeSlug?: string,
  limit = 5
): Promise<PopularArticle[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: { in: ARTICLE_TYPES },
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    select: { id: true, slug: true, title: true, views: true },
    orderBy: { views: "desc" },
    take: limit,
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    readCount: c.views,
  }));
}

export async function getArticleCategories(): Promise<ArticleCategory[]> {
  const categories = await prisma.category.findMany({
    where: {
      contents: {
        some: {
          ...getPublicContentWhere(),
          type: { in: ARTICLE_TYPES },
        },
      },
    },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          contents: {
            where: {
              ...getPublicContentWhere(),
              type: { in: ARTICLE_TYPES },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    slug: c.slug,
    label: c.name,
    count: c._count.contents,
  }));
}

export async function getPublishedArticles(
  limit = 24
): Promise<Article[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: { in: ARTICLE_TYPES },
    },
    include: contentListInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return contents.map(mapContentToArticle);
}

export async function getArticleCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      contents: {
        some: {
          ...getPublicContentWhere(),
          type: { in: ARTICLE_TYPES },
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return category;
}

export async function getPublishedArticlesByCategory(
  categorySlug: string,
  limit = 48
): Promise<Article[]> {
  const category = await getArticleCategoryBySlug(categorySlug);
  if (!category) return [];

  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: { in: ARTICLE_TYPES },
      categoryId: category.id,
    },
    include: contentListInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return contents.map(mapContentToArticle);
}

function mapContentToArticle(c: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  author: { name: string };
  category: { name: string } | null;
}): Article {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Genel",
    author: c.author.name,
    date: formatDateTR(c.publishedAt ?? c.createdAt),
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
  };
}

export async function getPublishedNews(limit = 24): Promise<NewsItem[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: "NEWS",
    },
    include: contentListInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Haber",
    date: formatDateTR(c.publishedAt ?? c.createdAt),
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
    featured: c.featured,
  }));
}

export async function getNewsCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      contents: {
        some: {
          ...getPublicContentWhere(),
          type: "NEWS",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return category;
}

export async function getPublishedNewsByCategory(
  categorySlug: string,
  limit = 48
): Promise<NewsItem[]> {
  const category = await getNewsCategoryBySlug(categorySlug);
  if (!category) return [];

  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: "NEWS",
      categoryId: category.id,
    },
    include: contentListInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Haber",
    date: formatDateTR(c.publishedAt ?? c.createdAt),
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
    featured: c.featured,
  }));
}


export async function getArticleSidebarData(excludeSlug?: string) {
  const [popularArticles, articleCategories] = await Promise.all([
    getPopularArticles(excludeSlug),
    getArticleCategories(),
  ]);

  return { popularArticles, articleCategories };
}

export async function getArticlePageData(slug: string) {
  const content = await prisma.content.findFirst({
    where: { slug, ...getPublicContentWhere(), type: { in: ARTICLE_TYPES } },
    include: {
      ...contentDetailInclude,
      author: {
        select: {
          id: true,
          name: true,
          title: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              contents: { where: getPublicContentWhere() },
            },
          },
        },
      },
    },
  });

  if (!content) return null;

  const article = mapToArticleDetail(content);
  article.author.articleCount = content.author._count.contents;

  const [relatedArticles, comments, sidebar] = await Promise.all([
    getRelatedArticles(slug, content.categoryId),
    getArticleComments(content.id),
    getArticleSidebarData(slug),
  ]);

  return { article, relatedArticles, comments, sidebar };
}

export async function getPublishedNewsSlugs(): Promise<string[]> {
  const contents = await prisma.content.findMany({
    where: { ...getPublicContentWhere(), type: "NEWS" },
    select: { slug: true },
  });
  return contents.map((c) => c.slug);
}

export async function getRelatedNews(
  slug: string,
  categoryId: string | null,
  limit = 3
): Promise<RelatedArticle[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: "NEWS",
      slug: { not: slug },
      ...(categoryId ? { categoryId } : {}),
    },
    include: contentListInclude,
    orderBy: { views: "desc" },
    take: limit,
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Haber",
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
    readTime: estimateReadTime(c.content),
  }));
}

export async function getNewsPageData(slug: string) {
  const content = await prisma.content.findFirst({
    where: { slug, ...getPublicContentWhere(), type: "NEWS" },
    include: {
      ...contentDetailInclude,
      author: {
        select: {
          id: true,
          name: true,
          title: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              contents: { where: { ...getPublicContentWhere(), type: "NEWS" } },
            },
          },
        },
      },
    },
  });

  if (!content) return null;

  const article = mapToArticleDetail(content);
  article.author.articleCount = content.author._count.contents;
  const newsSeo = resolveContentSeo(
    {
      title: content.title,
      slug: content.slug,
      summary: content.summary,
      coverImage: content.coverImage,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      ogImage: content.ogImage,
      canonicalUrl: content.canonicalUrl,
      noIndex: content.noIndex,
    },
    "/haberler",
    " | Haberler | TürkPDR"
  );
  article.seoTitle = newsSeo.title;
  article.seoDescription = newsSeo.description;
  article.ogImage = newsSeo.ogImage;
  article.canonicalUrl = newsSeo.canonicalUrl;
  article.noIndex = newsSeo.noIndex;

  const [relatedArticles, comments] = await Promise.all([
    getRelatedNews(slug, content.categoryId),
    getArticleComments(content.id),
  ]);

  const sidebar = {
    popularArticles: await getPopularNews(slug),
    articleCategories: await getNewsCategories(),
  };

  return { article, relatedArticles, comments, sidebar };
}

async function getPopularNews(
  excludeSlug?: string,
  limit = 5
): Promise<PopularArticle[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: "NEWS",
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    select: { id: true, slug: true, title: true, views: true },
    orderBy: { views: "desc" },
    take: limit,
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    readCount: c.views,
  }));
}

export async function getNewsCategories(): Promise<ArticleCategory[]> {
  const categories = await prisma.category.findMany({
    where: {
      contents: {
        some: {
          ...getPublicContentWhere(),
          type: "NEWS",
        },
      },
    },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          contents: {
            where: { ...getPublicContentWhere(), type: "NEWS" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    slug: c.slug,
    label: c.name,
    count: c._count.contents,
  }));
}
