import type { ContentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  contentListInclude,
  DEFAULT_AVATAR,
  DEFAULT_COVER_IMAGE,
  getPublicContentWhere,
  getPublicFileWhere,
  getPublicTestWhere,
} from "@/lib/queries/constants";
import { formatDateTR } from "@/lib/queries/format";
import type {
  Article,
  Author,
  FileItem,
  NewsItem,
  StatItem,
} from "@/types/home";
import type { PsychologicalTest } from "@/types/home";
import type { TestCategory } from "@/types/test";

const ARTICLE_TYPES: ContentType[] = [
  "ARTICLE",
  "GUIDE",
  "METAPHOR",
];

const CATEGORY_SLUG_TO_TEST: Record<string, TestCategory> = {
  cocuk: "cocuk",
  ergen: "ergen",
  yetiskin: "yetişkin",
  meslek: "meslek",
  klinik: "klinik",
};

function mapToHomeArticle(content: {
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
    id: content.id,
    slug: content.slug,
    title: content.title,
    excerpt: content.summary ?? "",
    category: content.category?.name ?? "Genel",
    author: content.author.name,
    date: formatDateTR(content.publishedAt ?? content.createdAt),
    coverImage: content.coverImage ?? DEFAULT_COVER_IMAGE,
  };
}

function mapToNewsItem(content: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  featured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string } | null;
}): NewsItem {
  return {
    id: content.id,
    slug: content.slug,
    title: content.title,
    excerpt: content.summary ?? "",
    category: content.category?.name ?? "Haber",
    date: formatDateTR(content.publishedAt ?? content.createdAt),
    coverImage: content.coverImage ?? DEFAULT_COVER_IMAGE,
    featured: content.featured,
  };
}

export async function getFeaturedArticles(limit = 6): Promise<Article[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      featured: true,
      type: { in: ARTICLE_TYPES },
    },
    include: contentListInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return contents.map(mapToHomeArticle);
}

export async function getLatestNews(limit = 5): Promise<NewsItem[]> {
  const contents = await prisma.content.findMany({
    where: {
      ...getPublicContentWhere(),
      type: "NEWS",
    },
    include: contentListInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return contents.map(mapToNewsItem);
}

export async function getAuthors(limit = 4): Promise<Author[]> {
  const authors = await prisma.user.findMany({
    where: {
      role: { in: ["AUTHOR", "EDITOR", "ADMIN"] },
      status: "ACTIVE",
      contents: {
        some: {
          ...getPublicContentWhere(),
        },
      },
    },
    select: {
      id: true,
      name: true,
      title: true,
      avatar: true,
      _count: {
        select: {
          contents: {
            where: getPublicContentWhere(),
          },
        },
      },
    },
    orderBy: {
      contents: { _count: "desc" },
    },
    take: limit,
  });

  return authors.map((author) => ({
    id: author.id,
    name: author.name,
    title: author.title ?? "Yazar",
    articleCount: author._count.contents,
    avatar: author.avatar ?? DEFAULT_AVATAR,
    slug: author.id,
  }));
}

export async function getHomeTests(limit = 8): Promise<PsychologicalTest[]> {
  const tests = await prisma.test.findMany({
    where: getPublicTestWhere(),
    include: { category: { select: { slug: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return tests.map((test) => ({
    id: test.id,
    title: test.title,
    category:
      CATEGORY_SLUG_TO_TEST[test.category?.slug ?? ""] ?? "klinik",
    duration: parseInt(test.duration ?? "10", 10) || 10,
    questionCount: test.questionCount ?? 0,
    slug: test.slug,
  }));
}

export async function getHomeFiles(limit = 6): Promise<FileItem[]> {
  const files = await prisma.fileAsset.findMany({
    where: getPublicFileWhere(),
    orderBy: { downloads: "desc" },
    take: limit,
  });

  return files.map((file) => ({
    id: file.id,
    name: file.title,
    category: file.fileType ?? "Dosya",
    downloadCount: file.downloads,
    slug: file.id,
  }));
}

export async function getHomeStats(): Promise<StatItem[]> {
  const [articleCount, testCount, memberCount, fileCount] = await Promise.all([
    prisma.content.count({
      where: { ...getPublicContentWhere(), type: { in: ARTICLE_TYPES } },
    }),
    prisma.test.count({ where: getPublicTestWhere() }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.fileAsset.count({ where: getPublicFileWhere() }),
  ]);

  return [
    { id: "articles", label: "Makale", value: articleCount, icon: "articles" },
    { id: "tests", label: "Test", value: testCount, icon: "tests" },
    { id: "members", label: "Üye", value: memberCount, icon: "members" },
    { id: "files", label: "Dosya", value: fileCount, icon: "files" },
  ];
}

export async function getHomePageData() {
  const [
    featuredArticles,
    latestNews,
    authors,
    tests,
    files,
    stats,
  ] = await Promise.all([
    getFeaturedArticles(),
    getLatestNews(),
    getAuthors(),
    getHomeTests(),
    getHomeFiles(),
    getHomeStats(),
  ]);

  return { featuredArticles, latestNews, authors, tests, files, stats };
}
