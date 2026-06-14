import type { ContentType } from "@prisma/client";

import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
  type ActivityEntityType,
} from "@/lib/activity-log";
import { contentTypeLabels } from "@/types/content";
import {
  TRASH_ENTITIES,
  type TrashEntity,
  type TrashListItem,
} from "@/types/trash";
import {
  deleteMediaFileFromDisk,
  findMediaUsages,
} from "@/lib/media/utils";
import { prisma } from "@/lib/prisma";

export const NOT_DELETED_WHERE = { deletedAt: null } as const;

export const TRASHED_WHERE = { deletedAt: { not: null } } as const;

export function isTrashEntity(value: string): value is TrashEntity {
  return TRASH_ENTITIES.includes(value as TrashEntity);
}

function getActivityEntityType(entity: TrashEntity): ActivityEntityType | string {
  switch (entity) {
    case "contents":
      return ACTIVITY_ENTITY_TYPES.CONTENT;
    case "files":
      return ACTIVITY_ENTITY_TYPES.FILE;
    case "tests":
      return ACTIVITY_ENTITY_TYPES.TEST;
    case "dictionary":
      return ACTIVITY_ENTITY_TYPES.DICTIONARY;
    case "media":
      return "MEDIA";
    default:
      return entity;
  }
}

async function logTrashAction(
  entity: TrashEntity,
  entityId: string,
  title: string,
  action:
    | typeof ACTIVITY_ACTIONS.ENTITY_TRASHED
    | typeof ACTIVITY_ACTIONS.ENTITY_RESTORED
    | typeof ACTIVITY_ACTIONS.ENTITY_DELETED_PERMANENTLY,
  userId: string,
  descriptionSuffix: string
) {
  await logActivity({
    userId,
    action,
    entityType: getActivityEntityType(entity),
    entityId,
    description: `"${title}" ${descriptionSuffix}`,
    metadata: { trashEntity: entity },
  });
}

export async function softDeleteEntity(
  entity: TrashEntity,
  id: string,
  userId: string
): Promise<{ title: string }> {
  const now = new Date();

  switch (entity) {
    case "contents": {
      const item = await prisma.content.findFirst({
        where: { id, ...NOT_DELETED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("İçerik bulunamadı.", 404);

      await prisma.content.update({
        where: { id },
        data: { deletedAt: now },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_TRASHED,
        userId,
        "çöp kutusuna taşındı"
      );

      return { title: item.title };
    }
    case "files": {
      const item = await prisma.fileAsset.findFirst({
        where: { id, ...NOT_DELETED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Dosya bulunamadı.", 404);

      await prisma.fileAsset.update({
        where: { id },
        data: { deletedAt: now },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_TRASHED,
        userId,
        "çöp kutusuna taşındı"
      );

      return { title: item.title };
    }
    case "tests": {
      const item = await prisma.test.findFirst({
        where: { id, ...NOT_DELETED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Test bulunamadı.", 404);

      await prisma.test.update({
        where: { id },
        data: { deletedAt: now },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_TRASHED,
        userId,
        "çöp kutusuna taşındı"
      );

      return { title: item.title };
    }
    case "dictionary": {
      const item = await prisma.dictionaryTerm.findFirst({
        where: { id, ...NOT_DELETED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Terim bulunamadı.", 404);

      await prisma.dictionaryTerm.update({
        where: { id },
        data: { deletedAt: now },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_TRASHED,
        userId,
        "çöp kutusuna taşındı"
      );

      return { title: item.title };
    }
    case "media": {
      const item = await prisma.mediaAsset.findFirst({
        where: { id, ...NOT_DELETED_WHERE },
        select: { id: true, title: true, fileName: true },
      });
      if (!item) throw new TrashEntityError("Medya bulunamadı.", 404);

      await prisma.mediaAsset.update({
        where: { id },
        data: { deletedAt: now },
      });

      const label = item.title?.trim() || item.fileName;
      await logTrashAction(
        entity,
        id,
        label,
        ACTIVITY_ACTIONS.ENTITY_TRASHED,
        userId,
        "çöp kutusuna taşındı"
      );

      return { title: label };
    }
    default:
      throw new TrashEntityError("Geçersiz varlık türü.", 400);
  }
}

export async function restoreEntity(
  entity: TrashEntity,
  id: string,
  userId: string
): Promise<{ title: string }> {
  switch (entity) {
    case "contents": {
      const item = await prisma.content.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda içerik bulunamadı.", 404);

      await prisma.content.update({
        where: { id },
        data: { deletedAt: null },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_RESTORED,
        userId,
        "geri yüklendi"
      );

      return { title: item.title };
    }
    case "files": {
      const item = await prisma.fileAsset.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda dosya bulunamadı.", 404);

      await prisma.fileAsset.update({
        where: { id },
        data: { deletedAt: null },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_RESTORED,
        userId,
        "geri yüklendi"
      );

      return { title: item.title };
    }
    case "tests": {
      const item = await prisma.test.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda test bulunamadı.", 404);

      await prisma.test.update({
        where: { id },
        data: { deletedAt: null },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_RESTORED,
        userId,
        "geri yüklendi"
      );

      return { title: item.title };
    }
    case "dictionary": {
      const item = await prisma.dictionaryTerm.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda terim bulunamadı.", 404);

      await prisma.dictionaryTerm.update({
        where: { id },
        data: { deletedAt: null },
      });

      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_RESTORED,
        userId,
        "geri yüklendi"
      );

      return { title: item.title };
    }
    case "media": {
      const item = await prisma.mediaAsset.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true, fileName: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda medya bulunamadı.", 404);

      await prisma.mediaAsset.update({
        where: { id },
        data: { deletedAt: null },
      });

      const label = item.title?.trim() || item.fileName;
      await logTrashAction(
        entity,
        id,
        label,
        ACTIVITY_ACTIONS.ENTITY_RESTORED,
        userId,
        "geri yüklendi"
      );

      return { title: label };
    }
    default:
      throw new TrashEntityError("Geçersiz varlık türü.", 400);
  }
}

export async function permanentlyDeleteEntity(
  entity: TrashEntity,
  id: string,
  userId: string
): Promise<{ title: string }> {
  switch (entity) {
    case "contents": {
      const item = await prisma.content.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda içerik bulunamadı.", 404);

      await prisma.content.delete({ where: { id } });
      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_DELETED_PERMANENTLY,
        userId,
        "kalıcı olarak silindi"
      );

      return { title: item.title };
    }
    case "files": {
      const item = await prisma.fileAsset.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda dosya bulunamadı.", 404);

      await prisma.fileAsset.delete({ where: { id } });
      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_DELETED_PERMANENTLY,
        userId,
        "kalıcı olarak silindi"
      );

      return { title: item.title };
    }
    case "tests": {
      const item = await prisma.test.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda test bulunamadı.", 404);

      await prisma.test.delete({ where: { id } });
      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_DELETED_PERMANENTLY,
        userId,
        "kalıcı olarak silindi"
      );

      return { title: item.title };
    }
    case "dictionary": {
      const item = await prisma.dictionaryTerm.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda terim bulunamadı.", 404);

      await prisma.dictionaryTerm.delete({ where: { id } });
      await logTrashAction(
        entity,
        id,
        item.title,
        ACTIVITY_ACTIONS.ENTITY_DELETED_PERMANENTLY,
        userId,
        "kalıcı olarak silindi"
      );

      return { title: item.title };
    }
    case "media": {
      const item = await prisma.mediaAsset.findFirst({
        where: { id, ...TRASHED_WHERE },
        select: { id: true, title: true, fileName: true, fileUrl: true },
      });
      if (!item) throw new TrashEntityError("Çöp kutusunda medya bulunamadı.", 404);

      const usages = await findMediaUsages(item.fileUrl);
      if (usages.length > 0) {
        throw new TrashEntityError(
          "Bu medya dosyası hâlâ kullanımda olduğu için kalıcı silinemez.",
          409
        );
      }

      await prisma.mediaAsset.delete({ where: { id } });
      await deleteMediaFileFromDisk(item.fileUrl);

      const label = item.title?.trim() || item.fileName;
      await logTrashAction(
        entity,
        id,
        label,
        ACTIVITY_ACTIONS.ENTITY_DELETED_PERMANENTLY,
        userId,
        "kalıcı olarak silindi"
      );

      return { title: label };
    }
    default:
      throw new TrashEntityError("Geçersiz varlık türü.", 400);
  }
}

export async function listTrashedItems(
  entity: TrashEntity,
  options: { skip: number; limit: number; search?: string }
): Promise<{ items: TrashListItem[]; total: number }> {
  const search = options.search?.trim();
  const searchFilter = search
    ? { contains: search, mode: "insensitive" as const }
    : undefined;

  switch (entity) {
    case "contents": {
      const where = {
        ...TRASHED_WHERE,
        ...(searchFilter
          ? {
              OR: [
                { title: searchFilter },
                { summary: searchFilter },
                { slug: searchFilter },
              ],
            }
          : {}),
      };

      const [rows, total] = await Promise.all([
        prisma.content.findMany({
          where,
          skip: options.skip,
          take: options.limit,
          orderBy: { deletedAt: "desc" },
          select: {
            id: true,
            title: true,
            type: true,
            slug: true,
            deletedAt: true,
            author: { select: { name: true } },
          },
        }),
        prisma.content.count({ where }),
      ]);

      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          subtitle: row.author.name,
          deletedAt: row.deletedAt!.toISOString(),
          meta: `${contentTypeLabels[row.type as ContentType]} · ${row.slug}`,
        })),
      };
    }
    case "files": {
      const where = {
        ...TRASHED_WHERE,
        ...(searchFilter
          ? {
              OR: [
                { title: searchFilter },
                { description: searchFilter },
                { fileType: searchFilter },
              ],
            }
          : {}),
      };

      const [rows, total] = await Promise.all([
        prisma.fileAsset.findMany({
          where,
          skip: options.skip,
          take: options.limit,
          orderBy: { deletedAt: "desc" },
          select: {
            id: true,
            title: true,
            fileType: true,
            deletedAt: true,
            uploadedBy: { select: { name: true } },
          },
        }),
        prisma.fileAsset.count({ where }),
      ]);

      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          subtitle: row.uploadedBy.name,
          deletedAt: row.deletedAt!.toISOString(),
          meta: row.fileType ?? "Dosya",
        })),
      };
    }
    case "tests": {
      const where = {
        ...TRASHED_WHERE,
        ...(searchFilter
          ? {
              OR: [
                { title: searchFilter },
                { slug: searchFilter },
                { description: searchFilter },
              ],
            }
          : {}),
      };

      const [rows, total] = await Promise.all([
        prisma.test.findMany({
          where,
          skip: options.skip,
          take: options.limit,
          orderBy: { deletedAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            deletedAt: true,
            category: { select: { name: true } },
          },
        }),
        prisma.test.count({ where }),
      ]);

      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          subtitle: row.category?.name ?? null,
          deletedAt: row.deletedAt!.toISOString(),
          meta: row.slug,
        })),
      };
    }
    case "dictionary": {
      const where = {
        ...TRASHED_WHERE,
        ...(searchFilter
          ? {
              OR: [
                { title: searchFilter },
                { slug: searchFilter },
                { category: searchFilter },
              ],
            }
          : {}),
      };

      const [rows, total] = await Promise.all([
        prisma.dictionaryTerm.findMany({
          where,
          skip: options.skip,
          take: options.limit,
          orderBy: { deletedAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            deletedAt: true,
          },
        }),
        prisma.dictionaryTerm.count({ where }),
      ]);

      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          subtitle: row.category,
          deletedAt: row.deletedAt!.toISOString(),
          meta: row.slug,
        })),
      };
    }
    case "media": {
      const where = {
        ...TRASHED_WHERE,
        ...(searchFilter
          ? {
              OR: [
                { title: searchFilter },
                { fileName: searchFilter },
                { fileUrl: searchFilter },
              ],
            }
          : {}),
      };

      const [rows, total] = await Promise.all([
        prisma.mediaAsset.findMany({
          where,
          skip: options.skip,
          take: options.limit,
          orderBy: { deletedAt: "desc" },
          select: {
            id: true,
            title: true,
            fileName: true,
            fileType: true,
            deletedAt: true,
          },
        }),
        prisma.mediaAsset.count({ where }),
      ]);

      return {
        total,
        items: rows.map((row) => ({
          id: row.id,
          title: row.title?.trim() || row.fileName,
          subtitle: row.fileName,
          deletedAt: row.deletedAt!.toISOString(),
          meta: row.fileType,
        })),
      };
    }
    default:
      return { items: [], total: 0 };
  }
}

export class TrashEntityError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TrashEntityError";
    this.status = status;
  }
}
