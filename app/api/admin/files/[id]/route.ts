import type { ContentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canDeleteContent,
  requireContentManager,
} from "@/lib/admin/api-auth";
import { normalizeMediaUrl } from "@/lib/media-url";
import { notifyPendingFile } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  NOT_DELETED_WHERE,
  softDeleteEntity,
  TrashEntityError,
} from "@/lib/trash/utils";

type RouteContext = { params: Promise<{ id: string }> };

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

function validateFileInput(body: FileInput): string | null {
  if (body.title !== undefined && !body.title.trim()) {
    return "Dosya başlığı boş olamaz.";
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

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const file = await prisma.fileAsset.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    include: fileInclude,
  });

  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ file: serializeFile(file) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: FileInput;
  try {
    body = (await request.json()) as FileInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateFileInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const existing = await prisma.fileAsset.findFirst({
    where: { id, ...NOT_DELETED_WHERE },
    select: { id: true, title: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  }

  const updateData: {
    title?: string;
    description?: string | null;
    fileUrl?: string;
    fileType?: string | null;
    fileSize?: number | null;
    status?: ContentStatus;
  } = {};

  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null;
  }
  if (body.fileUrl !== undefined) {
    updateData.fileUrl = normalizeMediaUrl(body.fileUrl.trim()) ?? body.fileUrl.trim();
  }
  if (body.fileType !== undefined) {
    updateData.fileType = body.fileType?.trim() || null;
  }
  if (body.fileSize !== undefined) updateData.fileSize = body.fileSize;
  if (body.status !== undefined) updateData.status = body.status;

  const file = await prisma.fileAsset.update({
    where: { id },
    data: updateData,
    include: fileInclude,
  });

  if (body.status === "PENDING" && existing.status !== "PENDING") {
    void notifyPendingFile({
      title: body.title?.trim() ?? existing.title,
      fileId: id,
    });
  }

  return NextResponse.json({
    file: serializeFile(file),
    message: "Dosya güncellendi.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  if (!canDeleteContent(auth.user.role)) {
    return NextResponse.json(
      { error: "Dosya silme yetkisi yalnızca yöneticilere aittir." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const result = await softDeleteEntity("files", id, auth.user.id);

    return NextResponse.json({
      message: `"${result.title}" çöp kutusuna taşındı.`,
    });
  } catch (error) {
    if (error instanceof TrashEntityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Dosya silinemedi." }, { status: 500 });
  }
}
