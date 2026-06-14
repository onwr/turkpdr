import type { Prisma } from "@prisma/client";

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
import { prisma } from "@/lib/prisma";
import type {
  ArticleCategory,
  ArticleComment,
  ArticleDetail,
  PopularArticle,
  RelatedArticle,
} from "@/types/article";
import type { Article } from "@/types/home";
import { PSIKO_SANAT_CATEGORIES } from "@/types/psiko-sanat";

const PSIKO_SANAT_TYPE = "PSIKO_SANAT" as const;

const publishedPsikoSanatWhere: Prisma.ContentWhereInput = {
  ...getPublicContentWhere(),
  type: PSIKO_SANAT_TYPE,
};

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
    _count?: { contents: number };
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
    "/psiko-sanat",
    " | Psiko Sanat | TürkPDR",
    `${content.title} — kitap, film ve sanat içerikleri.`
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
      articleCount: content.author._count?.contents ?? 0,
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

export async function getPublishedPsikoSanatSlugs(): Promise<string[]> {
  const contents = await prisma.content.findMany({
    where: publishedPsikoSanatWhere,
    select: { slug: true },
  });
  return contents.map((c) => c.slug);
}

export async function getPublishedPsikoSanat(
  search?: string,
  categorySlug?: string
): Promise<Article[]> {
  const where: Prisma.ContentWhereInput = { ...publishedPsikoSanatWhere };

  if (search?.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { summary: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  if (categorySlug?.trim()) {
    where.category = {
      slug: { equals: categorySlug.trim(), mode: "insensitive" },
      type: PSIKO_SANAT_TYPE,
    };
  }

  const contents = await prisma.content.findMany({
    where,
    include: contentListInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Genel",
    author: c.author.name,
    date: formatDateTR(c.publishedAt ?? c.createdAt),
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
  }));
}

export async function getPsikoSanatCategories(): Promise<ArticleCategory[]> {
  const dbCategories = await prisma.category.findMany({
    where: {
      type: PSIKO_SANAT_TYPE,
      contents: { some: publishedPsikoSanatWhere },
    },
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          contents: { where: publishedPsikoSanatWhere },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  if (dbCategories.length > 0) {
    return dbCategories.map((c) => ({
      slug: c.slug,
      label: c.name,
      count: c._count.contents,
    }));
  }

  return PSIKO_SANAT_CATEGORIES.map((c) => ({
    slug: c.slug,
    label: c.name,
    count: 0,
  }));
}

export async function getPopularPsikoSanat(
  excludeSlug?: string,
  limit = 5
): Promise<PopularArticle[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...publishedPsikoSanatWhere,
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

export async function getRelatedPsikoSanat(
  slug: string,
  categoryId: string | null,
  limit = 3
): Promise<RelatedArticle[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...publishedPsikoSanatWhere,
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

async function getPsikoSanatComments(
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

export async function getPsikoSanatPageData(slug: string) {
  const content = await prisma.content.findFirst({
    where: { slug, ...publishedPsikoSanatWhere },
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
              contents: { where: publishedPsikoSanatWhere },
            },
          },
        },
      },
    },
  });

  if (!content) return null;

  const article = mapToArticleDetail(content);

  const [relatedArticles, comments, popularArticles, articleCategories] =
    await Promise.all([
      getRelatedPsikoSanat(slug, content.categoryId),
      getPsikoSanatComments(content.id),
      getPopularPsikoSanat(slug),
      getPsikoSanatCategories(),
    ]);

  return {
    article,
    relatedArticles,
    comments,
    sidebar: { popularArticles, articleCategories },
  };
}
