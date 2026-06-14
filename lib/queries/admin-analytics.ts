import type { ContentType, Prisma } from "@prisma/client";

import {
  getContentEditUrl,
  getContentViewUrl,
  getFileEditUrl,
} from "@/lib/admin/content-display";
import { prisma } from "@/lib/prisma";
import { contentTypeLabels } from "@/types/content";
import type {
  AnalyticsAuthorItem,
  AnalyticsChartPoint,
  AnalyticsContentItem,
  AnalyticsDashboardData,
  AnalyticsFileItem,
  AnalyticsRange,
  AnalyticsStatItem,
  AnalyticsTestItem,
  AnalyticsTypeSlice,
} from "@/types/analytics";
import { ANALYTICS_RANGE_OPTIONS } from "@/types/analytics";

type RangeConfig = {
  start: Date | null;
  end: Date;
  chartGranularity: "day" | "month";
  chartStart: Date;
};

function endOfToday(): Date {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getAnalyticsRangeConfig(range: AnalyticsRange): RangeConfig {
  const end = endOfToday();

  if (range === "all") {
    const chartStart = new Date(end);
    chartStart.setMonth(chartStart.getMonth() - 11);
    chartStart.setDate(1);
    chartStart.setHours(0, 0, 0, 0);

    return {
      start: null,
      end,
      chartGranularity: "month",
      chartStart,
    };
  }

  const days = Number.parseInt(range, 10);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
    chartGranularity: "day",
    chartStart: start,
  };
}

function publishedContentWhere(
  config: RangeConfig
): Prisma.ContentWhereInput {
  const where: Prisma.ContentWhereInput = {
    status: "PUBLISHED",
    publishedAt: { not: null },
  };

  if (config.start) {
    where.publishedAt = {
      gte: config.start,
      lte: config.end,
    };
  }

  return where;
}

function createdAtWhere(
  config: RangeConfig
): Prisma.DateTimeFilter | undefined {
  if (!config.start) return undefined;
  return {
    gte: config.start,
    lte: config.end,
  };
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
    month: "short",
    year: "2-digit",
  });
}

function buildChartSeries(
  config: RangeConfig,
  dates: Date[]
): AnalyticsChartPoint[] {
  const buckets = new Map<string, number>();

  if (config.chartGranularity === "day") {
    const cursor = startOfDay(config.chartStart);
    const end = startOfDay(config.end);

    while (cursor <= end) {
      buckets.set(cursor.toISOString().slice(0, 10), 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const date of dates) {
      const key = startOfDay(date).toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    return Array.from(buckets.entries()).map(([key, count]) => {
      const labelDate = new Date(`${key}T00:00:00`);
      return {
        key,
        label: formatDayLabel(labelDate),
        count,
      };
    });
  }

  const cursor = new Date(config.chartStart);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  const endMonth = new Date(config.end);
  endMonth.setDate(1);
  endMonth.setHours(0, 0, 0, 0);

  while (cursor <= endMonth) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const date of dates) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([key, count]) => {
    const [year, month] = key.split("-");
    const labelDate = new Date(Number(year), Number(month) - 1, 1);
    return {
      key,
      label: formatMonthLabel(labelDate),
      count,
    };
  });
}

function serializeContentItem(
  item: {
    id: string;
    title: string;
    slug: string;
    type: ContentType;
    author: { name: string };
  },
  value: number
): AnalyticsContentItem {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    typeLabel: contentTypeLabels[item.type],
    value,
    authorName: item.author.name,
    viewUrl: getContentViewUrl(item.type, item.slug),
    editUrl: getContentEditUrl(item.type, item.id),
  };
}

async function fetchTopContentByEngagement(
  config: RangeConfig,
  model: "like" | "comment"
): Promise<AnalyticsContentItem[]> {
  const dateFilter = createdAtWhere(config);
  const where = dateFilter ? { createdAt: dateFilter } : undefined;

  const groups =
    model === "like"
      ? await prisma.like.groupBy({
          by: ["postId"],
          where,
          _count: { postId: true },
          orderBy: { _count: { postId: "desc" } },
          take: 10,
        })
      : await prisma.comment.groupBy({
          by: ["postId"],
          where,
          _count: { postId: true },
          orderBy: { _count: { postId: "desc" } },
          take: 10,
        });

  if (groups.length === 0) return [];

  const postIds = groups.map((group) => group.postId);
  const posts = await prisma.content.findMany({
    where: { id: { in: postIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      author: { select: { name: true } },
    },
  });

  const postMap = new Map(posts.map((post) => [post.id, post]));

  return groups
    .map((group) => {
      const post = postMap.get(group.postId);
      if (!post) return null;
      return serializeContentItem(post, group._count.postId);
    })
    .filter((item): item is AnalyticsContentItem => item !== null);
}

export async function getAdminAnalyticsData(
  range: AnalyticsRange
): Promise<AnalyticsDashboardData> {
  const config = getAnalyticsRangeConfig(range);
  const publishedWhere = publishedContentWhere(config);
  const createdAtFilter = createdAtWhere(config);

  const [
    viewsAggregate,
    downloadsAggregate,
    testCompletions,
    likesCount,
    commentsCount,
    newMembers,
    publishedCount,
    topReadRaw,
    topFilesRaw,
    testGroups,
    authorGroups,
    publishingRows,
    registrationRows,
    typeGroups,
    topLiked,
    topCommented,
  ] = await Promise.all([
    prisma.content.aggregate({
      _sum: { views: true },
      where: publishedWhere,
    }),
    prisma.fileAsset.aggregate({
      _sum: { downloads: true },
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
    }),
    prisma.testResult.count({
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
    }),
    prisma.like.count({
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
    }),
    prisma.comment.count({
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
    }),
    prisma.user.count({
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
    }),
    prisma.content.count({ where: publishedWhere }),
    prisma.content.findMany({
      where: publishedWhere,
      orderBy: { views: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        views: true,
        author: { select: { name: true } },
      },
    }),
    prisma.fileAsset.findMany({
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
      orderBy: { downloads: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        downloads: true,
        uploadedBy: { select: { name: true } },
      },
    }),
    prisma.testResult.groupBy({
      by: ["testId"],
      where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
      _count: { testId: true },
      orderBy: { _count: { testId: "desc" } },
      take: 10,
    }),
    prisma.content.groupBy({
      by: ["authorId"],
      where: publishedWhere,
      _count: { authorId: true },
      orderBy: { _count: { authorId: "desc" } },
      take: 10,
    }),
    prisma.content.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          gte: config.chartStart,
          lte: config.end,
          not: null,
        },
      },
      select: { publishedAt: true },
    }),
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: config.chartStart,
          lte: config.end,
        },
      },
      select: { createdAt: true },
    }),
    prisma.content.groupBy({
      by: ["type"],
      where: publishedWhere,
      _count: { type: true },
      orderBy: { _count: { type: "desc" } },
    }),
    fetchTopContentByEngagement(config, "like"),
    fetchTopContentByEngagement(config, "comment"),
  ]);

  const testIds = testGroups.map((group) => group.testId);
  const tests =
    testIds.length > 0
      ? await prisma.test.findMany({
          where: { id: { in: testIds } },
          select: { id: true, title: true, slug: true },
        })
      : [];
  const testMap = new Map(tests.map((test) => [test.id, test]));

  const authorIds = authorGroups.map((group) => group.authorId);
  const authors =
    authorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, name: true, avatar: true },
        })
      : [];
  const authorMap = new Map(authors.map((author) => [author.id, author]));

  const stats: AnalyticsStatItem[] = [
    {
      id: "views",
      label: "Toplam Görüntülenme",
      value: viewsAggregate._sum.views ?? 0,
      icon: "views",
    },
    {
      id: "downloads",
      label: "Toplam İndirme",
      value: downloadsAggregate._sum.downloads ?? 0,
      icon: "downloads",
    },
    {
      id: "tests",
      label: "Test Çözümü",
      value: testCompletions,
      icon: "tests",
    },
    {
      id: "members",
      label: "Yeni Üye",
      value: newMembers,
      icon: "members",
    },
    {
      id: "published",
      label: "Yayınlanan İçerik",
      value: publishedCount,
      icon: "published",
    },
    {
      id: "likes",
      label: "Toplam Beğeni",
      value: likesCount,
      icon: "likes",
    },
    {
      id: "comments",
      label: "Toplam Yorum",
      value: commentsCount,
      icon: "comments",
    },
  ];

  const topReadContent: AnalyticsContentItem[] = topReadRaw.map((item) =>
    serializeContentItem(item, item.views)
  );

  const topDownloadedFiles: AnalyticsFileItem[] = topFilesRaw.map((item) => ({
    id: item.id,
    title: item.title,
    value: item.downloads,
    uploadedBy: item.uploadedBy.name,
    editUrl: getFileEditUrl(item.id),
  }));

  const topCompletedTests: AnalyticsTestItem[] = testGroups
    .map((group) => {
      const test = testMap.get(group.testId);
      if (!test) return null;
      return {
        id: test.id,
        title: test.title,
        slug: test.slug,
        value: group._count.testId,
        editUrl: `/admin/tests/${test.id}/edit`,
      };
    })
    .filter((item): item is AnalyticsTestItem => item !== null);

  const topAuthors: AnalyticsAuthorItem[] = authorGroups
    .map((group) => {
      const author = authorMap.get(group.authorId);
      if (!author) return null;
      return {
        id: author.id,
        name: author.name,
        avatar: author.avatar,
        value: group._count.authorId,
      };
    })
    .filter((item): item is AnalyticsAuthorItem => item !== null);

  const contentPublishingChart = buildChartSeries(
    config,
    publishingRows
      .map((row) => row.publishedAt)
      .filter((date): date is Date => date !== null)
  );

  const memberRegistrationChart = buildChartSeries(
    config,
    registrationRows.map((row) => row.createdAt)
  );

  const contentTypeDistribution: AnalyticsTypeSlice[] = typeGroups.map(
    (group) => ({
      type: group.type,
      label: contentTypeLabels[group.type],
      count: group._count.type,
    })
  );

  const rangeLabel =
    ANALYTICS_RANGE_OPTIONS.find((option) => option.value === range)?.label ??
    "Tümü";

  return {
    range,
    rangeLabel,
    stats,
    topReadContent,
    topDownloadedFiles,
    topCompletedTests,
    topAuthors,
    topLikedContent: topLiked,
    topCommentedContent: topCommented,
    contentPublishingChart,
    memberRegistrationChart,
    contentTypeDistribution,
  };
}

export function parseAnalyticsRange(value: string | null): AnalyticsRange {
  if (value === "7" || value === "30" || value === "90" || value === "all") {
    return value;
  }
  return "30";
}
