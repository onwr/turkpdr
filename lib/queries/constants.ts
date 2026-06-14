import type { ContentStatus, Prisma } from "@prisma/client";

import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

export const PUBLISHED_STATUS: ContentStatus = "PUBLISHED";

/** @deprecated Admin-only; public queries should use getPublicContentWhere */
export const PUBLISHED_WHERE = { status: PUBLISHED_STATUS } as const;

export function getScheduledVisibilityFilter(
  now: Date = new Date()
): Prisma.ContentWhereInput {
  return {
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
  };
}

export function getPublicContentWhere(
  now: Date = new Date()
): Prisma.ContentWhereInput {
  return {
    ...NOT_DELETED_WHERE,
    status: PUBLISHED_STATUS,
    ...getScheduledVisibilityFilter(now),
  };
}

export function getPublicTestWhere(
  now: Date = new Date()
): Prisma.TestWhereInput {
  return {
    ...NOT_DELETED_WHERE,
    status: PUBLISHED_STATUS,
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
  };
}

export function getPublicDictionaryWhere(
  now: Date = new Date()
): Prisma.DictionaryTermWhereInput {
  return {
    ...NOT_DELETED_WHERE,
    status: "PUBLISHED",
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
  };
}

export function getPublicFileWhere(): Prisma.FileAssetWhereInput {
  return {
    ...NOT_DELETED_WHERE,
    status: PUBLISHED_STATUS,
  };
}

export const contentListInclude = {
  author: {
    select: { id: true, name: true, avatar: true, title: true },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  tags: {
    include: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

export const contentDetailInclude = {
  author: {
    select: {
      id: true,
      name: true,
      avatar: true,
      title: true,
      bio: true,
      email: true,
      createdAt: true,
    },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  tags: {
    include: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
  comments: {
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
  likes: {
    select: { id: true },
  },
  _count: {
    select: { likes: true, comments: true },
  },
} as const;

export const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80";

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

export const DEFAULT_PROFILE_COVER =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80";
