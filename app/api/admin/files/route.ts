import type { ContentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  requireContentManager,
} from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import { normalizeMediaUrl } from "@/lib/media-url";
import { notifyPendingFile } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import type { Prisma } from "@prisma/client";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

const VALID_STATUSES: ContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
];

function serializeFile(file: {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  downloads: number;
  status: ContentStatus;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: { id: string; name: string };
}) {
  return {
    id: file.id,
    title: file.title,
    description: file.description,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    fileSize: file.fileSize,
    downloads: file.downloads,
    status: file.status,
    uploadedById: file.uploadedById,
    uploadedBy: file.uploadedBy,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
}

type FileInput = {
  title?: string;
  description?: string | null;
  fileUrl?: string;
  fileType?: string | null;
  fileSize?: number | null;
  status?: ContentStatus;
};

function validateFileInput(body: FileInput, isCreate = false): string | null {
  if (isCreate && !body.title?.trim()) {
    return "Dosya başlığı zorunludur.";
  }
  if (body.title !== undefined && !body.title.trim()) {
    return "Dosya başlığı boş olamaz.";
  }
  if (isCreate && !body.fileUrl?.trim()) {
    return "Dosya yüklenmesi zorunludur.";
  }
  if (body.fileUrl !== undefined && !body.fileUrl.trim()) {
    return "Dosya URL'si boş olamaz.";
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return "Geçersiz dosya durumu.";
  }
  if (
    body.fileSize !== undefined &&
    body.fileSize !== null &&
    body.fileSize < 0
  ) {
    return "Dosya boyutu geçersiz.";
  }
  return null;
}

const fileInclude = {
  uploadedBy: { select: { id: true, name: true } },
} as const;

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status") as ContentStatus | null;

  const where: Prisma.FileAssetWhereInput = {
    ...NOT_DELETED_WHERE,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { fileType: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  const [files, total] = await Promise.all([
    prisma.fileAsset.findMany({
      where,
      skip,
      take: limit,
      include: fileInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.fileAsset.count({ where }),
  ]);

  const meta = buildPaginationMeta(total, page, limit);

  return NextResponse.json({
    files: files.map(serializeFile),
    ...meta,
  });
}

export async function POST(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  let body: FileInput;
  try {
    body = (await request.json()) as FileInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateFileInput(body, true);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const file = await prisma.fileAsset.create({
    data: {
      title: body.title!.trim(),
      description: body.description?.trim() || null,
      fileUrl: normalizeMediaUrl(body.fileUrl!.trim()) ?? body.fileUrl!.trim(),
      fileType: body.fileType?.trim() || "PDF",
      fileSize: body.fileSize ?? null,
      status: body.status ?? "DRAFT",
      uploadedById: auth.user.id,
    },
    include: fileInclude,
  });

  const fileStatus = body.status ?? "DRAFT";
  if (fileStatus === "PENDING") {
    void notifyPendingFile({
      title: file.title,
      fileId: file.id,
    });
  }

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.FILE_UPLOADED,
    entityType: ACTIVITY_ENTITY_TYPES.FILE,
    entityId: file.id,
    description: `"${file.title}" dosyası yüklendi`,
    metadata: { fileType: file.fileType, status: file.status },
  });

  return NextResponse.json(
    { file: serializeFile(file), message: "Dosya oluşturuldu." },
    { status: 201 }
  );
}
