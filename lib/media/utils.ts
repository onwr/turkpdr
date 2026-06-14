import type { Prisma } from "@prisma/client";

import { getContentEditUrl } from "@/lib/admin/content-display";
import { normalizeMediaUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";
import type { MediaAssetItem, MediaUsageItem } from "@/types/media";
import type { UploadCategory } from "@/types/upload";

type MediaRecord = {
  id: string;
  title: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  createdAt: Date;
  uploadedBy: { id: string; name: string } | null;
};

export function serializeMediaAsset(asset: MediaRecord): MediaAssetItem {
  return {
    id: asset.id,
    title: asset.title,
    fileName: asset.fileName,
    fileUrl: asset.fileUrl,
    fileType: asset.fileType,
    fileSize: asset.fileSize,
    category: asset.category,
    uploadedBy: asset.uploadedBy,
    createdAt: asset.createdAt.toISOString(),
  };
}

export const mediaInclude = {
  uploadedBy: { select: { id: true, name: true } },
} as const;

type CreateMediaInput = {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: UploadCategory;
  uploadedById?: string | null;
  title?: string | null;
};

export async function createMediaAsset(input: CreateMediaInput) {
  return prisma.mediaAsset.create({
    data: {
      title: input.title?.trim() || null,
      fileName: input.fileName,
      fileUrl: normalizeMediaUrl(input.fileUrl) ?? input.fileUrl,
      fileType: input.fileType,
      fileSize: input.fileSize,
      category: input.category,
      uploadedById: input.uploadedById ?? null,
    },
    include: mediaInclude,
  });
}

export async function findMediaUsages(fileUrl: string): Promise<MediaUsageItem[]> {
  const usages: MediaUsageItem[] = [];

  const [contents, fileAssets, tests, users] = await Promise.all([
    prisma.content.findMany({
      where: {
        OR: [{ coverImage: fileUrl }, { content: { contains: fileUrl } }],
      },
      select: { id: true, title: true, type: true, coverImage: true },
    }),
    prisma.fileAsset.findMany({
      where: { fileUrl },
      select: { id: true, title: true },
    }),
    prisma.test.findMany({
      where: {
        OR: [{ image: fileUrl }, { iframeUrl: fileUrl }],
      },
      select: { id: true, title: true, image: true, iframeUrl: true },
    }),
    prisma.user.findMany({
      where: {
        OR: [{ avatar: fileUrl }, { coverImage: fileUrl }],
      },
      select: { id: true, name: true, avatar: true, coverImage: true },
    }),
  ]);

  for (const content of contents) {
    const contexts: string[] = [];
    if (content.coverImage === fileUrl) contexts.push("Kapak görseli");
    if (contexts.length === 0) contexts.push("İçerik gövdesi");

    usages.push({
      type: "content",
      id: content.id,
      title: content.title,
      adminUrl: getContentEditUrl(content.type, content.id),
      context: contexts.join(", "),
    });
  }

  for (const file of fileAssets) {
    usages.push({
      type: "file",
      id: file.id,
      title: file.title,
      adminUrl: `/admin/files/${file.id}/edit`,
      context: "Dosya URL",
    });
  }

  for (const test of tests) {
    const contexts: string[] = [];
    if (test.image === fileUrl) contexts.push("Test görseli");
    if (test.iframeUrl === fileUrl) contexts.push("Video/iframe URL");
    usages.push({
      type: "test",
      id: test.id,
      title: test.title,
      adminUrl: `/admin/tests/${test.id}/edit`,
      context: contexts.join(", ") || "Test medyası",
    });
  }

  for (const user of users) {
    const contexts: string[] = [];
    if (user.avatar === fileUrl) contexts.push("Profil fotoğrafı");
    if (user.coverImage === fileUrl) contexts.push("Kapak görseli");
    usages.push({
      type: "user",
      id: user.id,
      title: user.name,
      adminUrl: `/admin/users`,
      context: contexts.join(", "),
    });
  }

  return usages;
}

export function buildMediaTypeWhere(
  type: string | null
): Prisma.MediaAssetWhereInput | null {
  switch (type) {
    case "image":
      return { category: "images" };
    case "pdf":
      return { category: "files", fileType: "application/pdf" };
    case "video":
      return { category: "videos" };
    default:
      return null;
  }
}

export async function deleteMediaFileFromDisk(fileUrl: string): Promise<void> {
  if (!fileUrl.startsWith("/uploads/")) return;

  const { unlink } = await import("fs/promises");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));

  try {
    await unlink(filePath);
  } catch {
    // Dosya zaten silinmiş olabilir
  }
}
