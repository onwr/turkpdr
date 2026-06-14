import type { ContentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_AVATAR,
  DEFAULT_COVER_IMAGE,
  getPublicContentWhere,
  getPublicFileWhere,
} from "@/lib/queries/constants";
import { formatDateTR, formatMonthYearTR } from "@/lib/queries/format";
import {
  resolveMediaUrl,
  resolveMediaUrlWithFallback,
} from "@/lib/media-url";
import type {
  PopularContent,
  ProfileFavorite,
  ProfileFile,
  ProfilePost,
  UserProfile,
} from "@/types/profile";

function contentTypeToPostType(type: ContentType): "makale" | "haber" {
  return type === "NEWS" ? "haber" : "makale";
}

export async function getAuthorProfileIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["AUTHOR", "EDITOR", "ADMIN"] },
      status: "ACTIVE",
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function getProfileById(
  id: string
): Promise<UserProfile | null> {
  const user = await prisma.user.findFirst({
    where: {
      id,
      status: "ACTIVE",
      role: { in: ["AUTHOR", "EDITOR", "ADMIN", "MEMBER"] },
    },
    select: {
      id: true,
      name: true,
      title: true,
      avatar: true,
      coverImage: true,
      bio: true,
      email: true,
      phone: true,
      city: true,
      website: true,
      workAreas: true,
      expertiseAreas: true,
      createdAt: true,
      contents: {
        where: getPublicContentWhere(),
        select: {
          category: { select: { name: true } },
          tags: { include: { tag: { select: { name: true } } } },
        },
        take: 20,
      },
      _count: {
        select: {
          contents: { where: getPublicContentWhere() },
          files: { where: getPublicFileWhere() },
          likes: true,
        },
      },
    },
  });

  if (!user) return null;

  const workAreas =
    user.workAreas.length > 0
      ? user.workAreas
      : [
          ...new Set(
            user.contents
              .map((c) => c.category?.name)
              .filter((name): name is string => Boolean(name))
          ),
        ];

  const expertiseAreas =
    user.expertiseAreas.length > 0
      ? user.expertiseAreas
      : [
          ...new Set(
            user.contents.flatMap((c) => c.tags.map((t) => t.tag.name))
          ),
        ].slice(0, 6);

  return {
    id: user.id,
    name: user.name,
    title: user.title ?? "Üye",
    avatar: resolveMediaUrlWithFallback(user.avatar, DEFAULT_AVATAR),
    coverImage: resolveMediaUrl(user.coverImage) ?? "",
    about: user.bio ?? "Henüz biyografi eklenmemiş.",
    workAreas,
    expertiseAreas,
    totalPosts: user._count.contents,
    totalFiles: user._count.files,
    totalLikes: user._count.likes,
    joinedAt: user.createdAt.toISOString().split("T")[0],
    joinedDate: formatMonthYearTR(user.createdAt),
    email: user.email,
    phone: user.phone ?? undefined,
    city: user.city ?? "Türkiye",
    website: user.website ?? undefined,
    seoTitle: `${user.name} — Profil | TürkPDR`,
    seoDescription: user.bio
      ? `${user.name} - ${user.bio.slice(0, 140)}`
      : `${user.name} TürkPDR profili.`,
  };
}

export async function getProfilePosts(userId: string): Promise<ProfilePost[]> {
  const contents = await prisma.content.findMany({
    where: { authorId: userId, ...getPublicContentWhere() },
    include: {
      category: { select: { name: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return contents.map((c) => ({
    id: c.id,
    title: c.title,
    excerpt: c.summary ?? "",
    category: c.category?.name ?? "Genel",
    type: contentTypeToPostType(c.type),
    slug: c.slug,
    date: formatDateTR(c.publishedAt ?? c.createdAt),
    likeCount: c._count.likes,
    coverImage: resolveMediaUrlWithFallback(c.coverImage, DEFAULT_COVER_IMAGE),
  }));
}

export async function getProfileFiles(userId: string): Promise<ProfileFile[]> {
  const files = await prisma.fileAsset.findMany({
    where: { uploadedById: userId, ...getPublicFileWhere() },
    orderBy: { createdAt: "desc" },
  });

  return files.map((f) => ({
    id: f.id,
    name: f.title,
    category: f.fileType ?? "Dosya",
    downloadCount: f.downloads,
    fileType: f.fileType ?? "PDF",
    slug: f.id,
    date: formatDateTR(f.createdAt),
  }));
}

export async function getProfileFavorites(
  userId: string
): Promise<ProfileFavorite[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      post: {
        select: { id: true, title: true, slug: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return favorites
    .filter((f) => f.post)
    .map((f) => ({
      id: f.id,
      title: f.post.title,
      type: contentTypeToPostType(f.post.type),
      slug: f.post.slug,
      savedAt: formatDateTR(f.createdAt),
    }));
}

export async function getProfilePopularContent(
  userId: string
): Promise<PopularContent[]> {
  const contents = await prisma.content.findMany({
    where: { authorId: userId, ...getPublicContentWhere() },
    select: { id: true, title: true, slug: true, type: true, views: true },
    orderBy: { views: "desc" },
    take: 5,
  });

  return contents.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type === "NEWS" ? "Haber" : "Makale",
    slug: c.slug,
    viewCount: c.views,
  }));
}

export async function getProfilePageData(id: string) {
  const profile = await getProfileById(id);
  if (!profile) return null;

  const [posts, files, favorites, popular] = await Promise.all([
    getProfilePosts(id),
    getProfileFiles(id),
    getProfileFavorites(id),
    getProfilePopularContent(id),
  ]);

  return { profile, posts, files, favorites, popular };
}
