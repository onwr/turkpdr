import type { ContentStatus } from "@prisma/client";

import {
  formatContentDate,
  getContentEditUrl,
  getContentViewUrl,
  getFileEditUrl,
} from "@/lib/admin/content-display";
import { getNotifications } from "@/lib/notifications";
import { getLatestActivities } from "@/lib/queries/activity-log";
import { prisma } from "@/lib/prisma";
import { contentTypeLabels } from "@/types/content";
import type {
  AdminDashboardData,
  AdminStat,
  DashboardComment,
  DashboardFile,
  DashboardLatestContent,
  DashboardMember,
  DashboardPendingItem,
} from "@/types/admin";

type PendingRow = {
  id: string;
  entityType: "content" | "file";
  title: string;
  typeLabel: string;
  author: string;
  createdAt: Date;
  status: ContentStatus;
  editUrl: string;
  assignedEditor: { id: string; name: string } | null;
};

function buildStats(
  counts: {
    members: number;
    articles: number;
    news: number;
    files: number;
    videos: number;
    pendingContents: number;
    pendingFiles: number;
  }
): AdminStat[] {
  return [
    { id: "members", label: "Toplam Üye", value: counts.members, icon: "members" },
    { id: "articles", label: "Toplam Makale", value: counts.articles, icon: "articles" },
    { id: "news", label: "Toplam Haber", value: counts.news, icon: "news" },
    { id: "files", label: "Toplam Dosya", value: counts.files, icon: "files" },
    { id: "videos", label: "Toplam Video", value: counts.videos, icon: "videos" },
    {
      id: "pending",
      label: "Bekleyen İçerik",
      value: counts.pendingContents + counts.pendingFiles,
      icon: "pending",
    },
  ];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    members,
    articles,
    news,
    files,
    videos,
    pendingContentsCount,
    pendingFilesCount,
    pendingContents,
    pendingFiles,
    latestContentsRaw,
    latestMembersRaw,
    latestCommentsRaw,
    latestFilesRaw,
    notifications,
    latestActivities,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.content.count({ where: { type: "ARTICLE" } }),
    prisma.content.count({ where: { type: "NEWS" } }),
    prisma.fileAsset.count(),
    prisma.content.count({ where: { type: "VIDEO" } }),
    prisma.content.count({ where: { status: "PENDING" } }),
    prisma.fileAsset.count({ where: { status: "PENDING" } }),
    prisma.content.findMany({
      where: { status: "PENDING" },
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
        author: { select: { name: true } },
        assignedEditor: { select: { id: true, name: true } },
      },
    }),
    prisma.fileAsset.findMany({
      where: { status: "PENDING" },
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        uploadedBy: { select: { name: true } },
      },
    }),
    prisma.content.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
      },
    }),
    prisma.comment.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { name: true } },
        post: { select: { id: true, title: true, slug: true, type: true } },
      },
    }),
    prisma.fileAsset.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        fileType: true,
        status: true,
        createdAt: true,
        uploadedBy: { select: { name: true } },
      },
    }),
    getNotifications(5),
    getLatestActivities(8),
  ]);

  const stats = buildStats({
    members,
    articles,
    news,
    files,
    videos,
    pendingContents: pendingContentsCount,
    pendingFiles: pendingFilesCount,
  });

  const pendingRows: PendingRow[] = [
    ...pendingContents.map((item) => ({
      id: item.id,
      entityType: "content" as const,
      title: item.title,
      typeLabel: contentTypeLabels[item.type],
      author: item.author.name,
      createdAt: item.createdAt,
      status: item.status,
      editUrl: getContentEditUrl(item.type, item.id),
      assignedEditor: item.assignedEditor,
    })),
    ...pendingFiles.map((item) => ({
      id: item.id,
      entityType: "file" as const,
      title: item.title,
      typeLabel: "Dosya",
      author: item.uploadedBy.name,
      createdAt: item.createdAt,
      status: item.status,
      editUrl: getFileEditUrl(item.id),
      assignedEditor: null,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const pendingItems: DashboardPendingItem[] = pendingRows.map((item) => ({
    id: item.id,
    entityType: item.entityType,
    title: item.title,
    typeLabel: item.typeLabel,
      author: item.author,
      date: formatContentDate(item.createdAt.toISOString()),
      status: item.status,
      editUrl: item.editUrl,
      assignedEditor: item.assignedEditor ?? null,
    }));

  const latestContents: DashboardLatestContent[] = latestContentsRaw.map(
    (item) => ({
      id: item.id,
      title: item.title,
      typeLabel: contentTypeLabels[item.type],
      author: item.author.name,
      date: formatContentDate(item.createdAt.toISOString()),
      editUrl: getContentEditUrl(item.type, item.id),
    })
  );

  const latestMembers: DashboardMember[] = latestMembersRaw.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    status: item.status,
    avatar: item.avatar,
    createdAt: item.createdAt.toISOString(),
  }));

  const latestComments: DashboardComment[] = latestCommentsRaw.map((item) => ({
    id: item.id,
    content: item.content,
    userName: item.user.name,
    postTitle: item.post.title,
    postId: item.post.id,
    createdAt: item.createdAt.toISOString(),
    postViewUrl: getContentViewUrl(item.post.type, item.post.slug),
  }));

  const latestFiles: DashboardFile[] = latestFilesRaw.map((item) => ({
    id: item.id,
    title: item.title,
    uploadedBy: item.uploadedBy.name,
    fileType: item.fileType,
    createdAt: item.createdAt.toISOString(),
    status: item.status,
    editUrl: getFileEditUrl(item.id),
  }));

  return {
    stats,
    pendingItems,
    latestContents,
    latestMembers,
    latestComments,
    latestFiles,
    notifications,
    latestActivities,
  };
}
