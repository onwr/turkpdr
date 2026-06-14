import { prisma } from "@/lib/prisma";
import {
  getUserNotifications,
  getUserUnreadNotificationCount,
} from "@/lib/notifications";
import { toAppContentStatus } from "@/types/content";
import {
  getContentTypeLabel,
  getFavoriteHref,
  getPublishedContentHref,
} from "@/lib/account/content-url";
import {
  DEFAULT_AVATAR,
  DEFAULT_COVER_IMAGE,
} from "@/lib/queries/constants";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";
import { formatDateTR } from "@/lib/queries/format";
import { getTotalUnreadCount } from "@/lib/queries/messages";
import type {
  AccountContentItem,
  AccountFavoriteItem,
  AccountFileItem,
  AccountProfileData,
  AccountSummary,
  AccountTestResultItem,
} from "@/types/account";

function calculateProfileCompletion(user: {
  avatar: string | null;
  coverImage: string | null;
  title: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  website: string | null;
  workAreas: string[];
  expertiseAreas: string[];
}): number {
  const checks = [
    Boolean(user.avatar),
    Boolean(user.coverImage),
    Boolean(user.title?.trim()),
    Boolean(user.bio?.trim()),
    Boolean(user.phone?.trim()),
    Boolean(user.city?.trim()),
    Boolean(user.website?.trim()),
    user.workAreas.length > 0,
    user.expertiseAreas.length > 0,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function mapContentItem(content: {
  id: string;
  title: string;
  slug: string;
  status: Parameters<typeof toAppContentStatus>[0];
  type: AccountContentItem["type"];
  views: number;
  createdAt: Date;
  reviewNote: string | null;
  reviewedAt: Date | null;
  category: { name: string } | null;
}): AccountContentItem {
  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    status: toAppContentStatus(content.status),
    type: content.type,
    typeLabel: getContentTypeLabel(content.type),
    category: content.category?.name ?? null,
    views: content.views,
    createdAt: formatDateTR(content.createdAt),
    reviewNote: content.reviewNote,
    reviewedAt: content.reviewedAt
      ? formatDateTR(content.reviewedAt)
      : null,
    href:
      content.status === "PUBLISHED"
        ? getPublishedContentHref(content.type, content.slug)
        : null,
  };
}

export async function getAccountContents(
  userId: string
): Promise<AccountContentItem[]> {
  const contents = await prisma.content.findMany({
    where: { authorId: userId, ...NOT_DELETED_WHERE },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      type: true,
      views: true,
      createdAt: true,
      reviewNote: true,
      reviewedAt: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return contents.map(mapContentItem);
}

export async function getAccountFavorites(
  userId: string
): Promise<AccountFavoriteItem[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          status: true,
          summary: true,
          coverImage: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites
    .filter((item) => item.post && item.post.status === "PUBLISHED")
    .map((item) => ({
      id: item.id,
      postId: item.post.id,
      title: item.post.title,
      slug: item.post.slug,
      type: item.post.type,
      typeLabel: getContentTypeLabel(item.post.type),
      category: item.post.category?.name ?? null,
      summary: item.post.summary,
      coverImage: item.post.coverImage ?? DEFAULT_COVER_IMAGE,
      savedAt: formatDateTR(item.createdAt),
      href: getFavoriteHref(item.post.type, item.post.slug),
    }));
}

export async function getAccountTestResults(
  userId: string
): Promise<AccountTestResultItem[]> {
  const results = await prisma.testResult.findMany({
    where: { userId },
    include: {
      test: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return results.map((result) => ({
    id: result.id,
    testTitle: result.test.title,
    testSlug: result.test.slug,
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    resultLabel: result.resultLabel,
    createdAt: formatDateTR(result.createdAt),
    href: `/test-merkezi/${result.test.slug}/sonuc?id=${result.id}`,
  }));
}

export async function getAccountFiles(
  userId: string
): Promise<AccountFileItem[]> {
  const files = await prisma.fileAsset.findMany({
    where: { uploadedById: userId, ...NOT_DELETED_WHERE },
    orderBy: { createdAt: "desc" },
  });

  return files.map((file) => ({
    id: file.id,
    title: file.title,
    description: file.description,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    fileSize: file.fileSize,
    downloads: file.downloads,
    status: file.status,
    createdAt: formatDateTR(file.createdAt),
  }));
}

export async function getAccountProfileData(
  userId: string
): Promise<AccountProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
      title: true,
      bio: true,
      avatar: true,
      coverImage: true,
      phone: true,
      city: true,
      website: true,
      workAreas: true,
      expertiseAreas: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title ?? "",
    bio: user.bio ?? "",
    avatar: user.avatar ?? DEFAULT_AVATAR,
    coverImage: user.coverImage ?? "",
    phone: user.phone ?? "",
    city: user.city ?? "",
    website: user.website ?? "",
    workAreas: user.workAreas,
    expertiseAreas: user.expertiseAreas,
    role: user.role,
    createdAt: formatDateTR(user.createdAt),
  };
}

export async function getAccountSummary(
  userId: string
): Promise<AccountSummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      avatar: true,
      coverImage: true,
      title: true,
      bio: true,
      phone: true,
      city: true,
      website: true,
      workAreas: true,
      expertiseAreas: true,
    },
  });

  const [
    totalPosts,
    pendingPosts,
    favorites,
    testResults,
    messages,
    files,
    recentPosts,
    recentTestResults,
    recentFavorites,
    recentNotifications,
    unreadNotifications,
  ] = await Promise.all([
    prisma.content.count({ where: { authorId: userId, ...NOT_DELETED_WHERE } }),
    prisma.content.count({
      where: { authorId: userId, status: "PENDING" },
    }),
    prisma.favorite.count({ where: { userId } }),
    prisma.testResult.count({ where: { userId } }),
    getTotalUnreadCount(userId),
    prisma.fileAsset.count({ where: { uploadedById: userId } }),
    prisma.content.findMany({
      where: { authorId: userId, ...NOT_DELETED_WHERE },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        type: true,
        views: true,
        createdAt: true,
        reviewNote: true,
        reviewedAt: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.testResult.findMany({
      where: { userId },
      include: { test: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.favorite.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getUserNotifications(userId, 5),
    getUserUnreadNotificationCount(userId),
  ]);

  return {
    stats: {
      totalPosts,
      pendingPosts,
      favorites,
      testResults,
      messages,
      files,
    },
    recentPosts: recentPosts.map(mapContentItem),
    recentTestResults: recentTestResults.map((result) => ({
      id: result.id,
      testTitle: result.test.title,
      testSlug: result.test.slug,
      totalScore: result.totalScore,
      maxScore: result.maxScore,
      resultLabel: result.resultLabel,
      createdAt: formatDateTR(result.createdAt),
      href: `/test-merkezi/${result.test.slug}/sonuc?id=${result.id}`,
    })),
    recentFavorites: recentFavorites
      .filter((item) => item.post && item.post.status === "PUBLISHED")
      .map((item) => ({
        id: item.id,
        postId: item.post.id,
        title: item.post.title,
        slug: item.post.slug,
        type: item.post.type,
        typeLabel: getContentTypeLabel(item.post.type),
        category: null,
        summary: null,
        coverImage: DEFAULT_COVER_IMAGE,
        savedAt: formatDateTR(item.createdAt),
        href: getFavoriteHref(item.post.type, item.post.slug),
      })),
    recentNotifications,
    unreadNotifications,
    profileCompletion: user ? calculateProfileCompletion(user) : 0,
  };
}
