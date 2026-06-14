import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const ACTIVITY_ACTIONS = {
  CONTENT_CREATED: "CONTENT_CREATED",
  CONTENT_UPDATED: "CONTENT_UPDATED",
  CONTENT_PUBLISHED: "CONTENT_PUBLISHED",
  CONTENT_REJECTED: "CONTENT_REJECTED",
  CONTENT_REVISION_REQUESTED: "CONTENT_REVISION_REQUESTED",
  CONTENT_ASSIGNED: "CONTENT_ASSIGNED",
  CONTENT_RESUBMITTED: "CONTENT_RESUBMITTED",
  FILE_UPLOADED: "FILE_UPLOADED",
  FILE_DELETED: "FILE_DELETED",
  TEST_CREATED: "TEST_CREATED",
  TEST_PUBLISHED: "TEST_PUBLISHED",
  DICTIONARY_CREATED: "DICTIONARY_CREATED",
  DICTIONARY_PUBLISHED: "DICTIONARY_PUBLISHED",
  USER_REGISTERED: "USER_REGISTERED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_STATUS_CHANGED: "USER_STATUS_CHANGED",
  MESSAGE_SENT: "MESSAGE_SENT",
  COMMENT_ADDED: "COMMENT_ADDED",
  ENTITY_TRASHED: "ENTITY_TRASHED",
  ENTITY_RESTORED: "ENTITY_RESTORED",
  ENTITY_DELETED_PERMANENTLY: "ENTITY_DELETED_PERMANENTLY",
} as const;

export type ActivityAction =
  (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

export const ACTIVITY_ENTITY_TYPES = {
  CONTENT: "CONTENT",
  FILE: "FILE",
  TEST: "TEST",
  DICTIONARY: "DICTIONARY",
  USER: "USER",
  MESSAGE: "MESSAGE",
  COMMENT: "COMMENT",
  MEDIA: "MEDIA",
} as const;

export type ActivityEntityType =
  (typeof ACTIVITY_ENTITY_TYPES)[keyof typeof ACTIVITY_ENTITY_TYPES];

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  CONTENT_CREATED: "İçerik Oluşturma",
  CONTENT_UPDATED: "İçerik Güncelleme",
  CONTENT_PUBLISHED: "İçerik Yayınlama",
  CONTENT_REJECTED: "İçerik Reddetme",
  CONTENT_REVISION_REQUESTED: "Revizyon İsteme",
  CONTENT_ASSIGNED: "Editör Atama",
  CONTENT_RESUBMITTED: "Tekrar Onaya Gönderme",
  FILE_UPLOADED: "Dosya Yükleme",
  FILE_DELETED: "Dosya Silme",
  TEST_CREATED: "Test Oluşturma",
  TEST_PUBLISHED: "Test Yayınlama",
  DICTIONARY_CREATED: "Sözlük Terimi Oluşturma",
  DICTIONARY_PUBLISHED: "Sözlük Terimi Yayınlama",
  USER_REGISTERED: "Yeni Kullanıcı Kaydı",
  USER_ROLE_CHANGED: "Rol Değiştirme",
  USER_STATUS_CHANGED: "Durum Değiştirme",
  MESSAGE_SENT: "Mesaj Gönderme",
  COMMENT_ADDED: "Yorum Ekleme",
  ENTITY_TRASHED: "Çöp Kutusuna Taşıma",
  ENTITY_RESTORED: "Geri Yükleme",
  ENTITY_DELETED_PERMANENTLY: "Kalıcı Silme",
};

export const ACTIVITY_ENTITY_LABELS: Record<ActivityEntityType, string> = {
  CONTENT: "İçerik",
  FILE: "Dosya",
  TEST: "Test",
  DICTIONARY: "Sözlük",
  USER: "Kullanıcı",
  MESSAGE: "Mesaj",
  COMMENT: "Yorum",
  MEDIA: "Medya",
};

export type LogActivityInput = {
  userId?: string | null;
  action: ActivityAction | string;
  entityType: ActivityEntityType | string;
  entityId?: string | null;
  description: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        description: input.description,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
}
