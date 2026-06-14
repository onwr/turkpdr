import { prisma } from "@/lib/prisma";
import {
  contentDetailInclude,
  contentListInclude,
  DEFAULT_AVATAR,
  DEFAULT_COVER_IMAGE,
  getPublicContentWhere,
} from "@/lib/queries/constants";
import { estimateReadTime, formatDateTR } from "@/lib/queries/format";
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

const VIDEO_WHERE = { ...getPublicContentWhere(), type: "VIDEO" as const };

function mapVideoDetail(content: {
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
    _count: { contents: number };
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
    "/videolar",
    " | Videolar | TürkPDR"
  );

  return {
    id: content.id,
    slug: content.slug,
    title: content.title,
    excerpt: content.summary ?? "",
    category: content.category?.name ?? "Video",
    categorySlug: content.category?.slug ?? "video",
    author: {
      name: content.author.name,
      title: content.author.title ?? "Yazar",
      avatar: resolveMediaUrlWithFallback(
        content.author.avatar,
        DEFAULT_AVATAR
      ),
      bio: content.author.bio ?? "",
      slug: content.author.id,
      articleCount: content.author._count.contents,
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

export async function getPublishedVideos(limit = 48): Promise<Article[]> {
  const contents = await prisma.content.findMany({
    where: VIDEO_WHERE,
    include: contentListInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return contents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Video",
    author: c.author.name,
    date: formatDateTR(c.publishedAt ?? c.createdAt),
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
  }));
}

export async function getPublishedVideoSlugs(): Promise<string[]> {
  const contents = await prisma.content.findMany({
    where: VIDEO_WHERE,
    select: { slug: true },
  });
  return contents.map((c) => c.slug);
}

export async function getVideoPageData(slug: string) {
  const content = await prisma.content.findFirst({
    where: { slug, ...VIDEO_WHERE },
    include: {
      ...contentDetailInclude,
      author: {
        select: {
          id: true,
          name: true,
          title: true,
          avatar: true,
          bio: true,
          _count: {
            select: {
              contents: { where: VIDEO_WHERE },
            },
          },
        },
      },
    },
  });

  if (!content) return null;

  const article = mapVideoDetail(content);

  const [relatedContents, comments, popular, categories] = await Promise.all([
    prisma.content.findMany({
      where: {
        ...VIDEO_WHERE,
        slug: { not: slug },
        ...(content.categoryId ? { categoryId: content.categoryId } : {}),
      },
      include: contentListInclude,
      orderBy: { views: "desc" },
      take: 3,
    }),
    prisma.comment.findMany({
      where: { postId: content.id },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.content.findMany({
      where: { ...VIDEO_WHERE, slug: { not: slug } },
      select: { id: true, slug: true, title: true, views: true },
      orderBy: { views: "desc" },
      take: 5,
    }),
    prisma.category.findMany({
      where: { contents: { some: VIDEO_WHERE } },
      select: {
        slug: true,
        name: true,
        _count: { select: { contents: { where: VIDEO_WHERE } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const relatedArticles: RelatedArticle[] = relatedContents.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Video",
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
    readTime: estimateReadTime(c.content),
  }));

  const articleComments: ArticleComment[] = comments.map((c) => ({
    id: c.id,
    author: c.user.name,
    avatar: resolveMediaUrlWithFallback(c.user.avatar, DEFAULT_AVATAR),
    date: formatDateTR(c.createdAt),
    content: c.content,
  }));

  const popularArticles: PopularArticle[] = popular.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    readCount: c.views,
  }));

  const articleCategories: ArticleCategory[] = categories.map((c) => ({
    slug: c.slug,
    label: c.name,
    count: c._count.contents,
  }));

  return {
    article,
    relatedArticles,
    comments: articleComments,
    sidebar: { popularArticles, articleCategories },
  };
}
