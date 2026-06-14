import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPublicFileWhere } from "@/lib/queries/constants";
import type { FileCategoryGroup, PublicFileItem } from "@/types/files";

const FILE_TYPE_LABELS: Record<string, string> = {
  PDF: "PDF Dosyaları",
  DOC: "Word Dosyaları",
  DOCX: "Word Dosyaları",
  XLS: "Excel Dosyaları",
  XLSX: "Excel Dosyaları",
  PPT: "Sunum Dosyaları",
  PPTX: "Sunum Dosyaları",
};

function getFileTypeLabel(type: string): string {
  return FILE_TYPE_LABELS[type.toUpperCase()] ?? `${type} Dosyaları`;
}

export async function getPublishedFiles(
  fileType?: string
): Promise<PublicFileItem[]> {
  const where: Prisma.FileAssetWhereInput = {
    ...getPublicFileWhere(),
    ...(fileType ? { fileType: { equals: fileType, mode: "insensitive" } } : {}),
  };

  const files = await prisma.fileAsset.findMany({
    where,
    include: {
      uploadedBy: { select: { name: true } },
    },
    orderBy: { downloads: "desc" },
  });

  return files.map((file) => ({
    id: file.id,
    title: file.title,
    description: file.description,
    fileType: file.fileType,
    fileSize: file.fileSize,
    downloads: file.downloads,
    uploadedBy: file.uploadedBy.name,
  }));
}

export async function getFileCategories(): Promise<FileCategoryGroup[]> {
  const files = await prisma.fileAsset.findMany({
    where: getPublicFileWhere(),
    select: { fileType: true },
  });

  const counts = new Map<string, number>();

  for (const file of files) {
    const type = (file.fileType ?? "Diğer").toUpperCase();
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({
      type,
      label: getFileTypeLabel(type),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getFilesPageData(fileType?: string) {
  const [files, categories] = await Promise.all([
    getPublishedFiles(fileType),
    getFileCategories(),
  ]);

  return { files, categories };
}

export { getFileTypeLabel };
