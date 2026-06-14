import type { NotificationType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  USER_NOTIFICATION_TYPES,
  type AccountNotificationFilter,
  type NotificationItem,
  type UserNotificationType,
} from "@/types/notifications";

const adminNotificationWhere = {
  user: { is: null },
} satisfies Prisma.NotificationWhereInput;

function userNotificationWhere(userId: string): Prisma.NotificationWhereInput {
  return { userId };
}

export function serializeNotification(notification: {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date;
}): NotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    actionUrl: notification.actionUrl,
    createdAt: notification.createdAt.toISOString(),
  };
}

type CreateNotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string | null;
  userId?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  const data: Prisma.NotificationUncheckedCreateInput = {
    title: input.title,
    message: input.message,
    type: input.type,
    actionUrl: input.actionUrl ?? null,
    userId: input.userId ?? null,
  };

  return prisma.notification.create({ data });
}

async function safeNotify(input: CreateNotificationInput) {
  try {
    await createNotification(input);
  } catch (error) {
    console.error("Bildirim oluşturulamadı:", error);
  }
}

export async function notifyNewComment(params: {
  authorName: string;
  contentTitle: string;
  contentSlug: string;
}) {
  await safeNotify({
    title: "Yeni Yorum",
    message: `${params.authorName}, "${params.contentTitle}" içeriğine yorum yaptı.`,
    type: "NEW_COMMENT",
    actionUrl: `/makaleler/${params.contentSlug}`,
  });
}

export async function notifyAuthorNewComment(params: {
  authorId: string;
  commenterId: string;
  commenterName: string;
  contentTitle: string;
  contentSlug: string;
  contentType: string;
}) {
  if (params.authorId === params.commenterId) return;

  const path =
    params.contentType === "NEWS"
      ? `/haberler/${params.contentSlug}`
      : `/makaleler/${params.contentSlug}`;

  await safeNotify({
    title: "İçeriğinize Yorum Yapıldı",
    message: `${params.commenterName}, "${params.contentTitle}" içeriğinize yorum yaptı.`,
    type: "NEW_COMMENT",
    actionUrl: path,
    userId: params.authorId,
  });
}

export async function notifyNewUser(params: {
  userName: string;
  userId: string;
}) {
  await safeNotify({
    title: "Yeni Üye Kaydı",
    message: `${params.userName} platforma kayıt oldu.`,
    type: "NEW_USER",
    actionUrl: `/profil/${params.userId}`,
  });
}

export async function notifyPendingContent(params: {
  title: string;
  contentId: string;
}) {
  await safeNotify({
    title: "Onay Bekleyen İçerik",
    message: `"${params.title}" içeriği onay bekliyor.`,
    type: "PENDING_CONTENT",
    actionUrl: `/admin/contents/${params.contentId}/edit`,
  });
}

export async function notifyPendingFile(params: {
  title: string;
  fileId: string;
}) {
  await safeNotify({
    title: "Onay Bekleyen Dosya",
    message: `"${params.title}" dosyası onay bekliyor.`,
    type: "NEW_FILE",
    actionUrl: `/admin/files/${params.fileId}/edit`,
  });
}

export async function notifyNewMessage(params: {
  receiverId: string;
  senderId: string;
  senderName: string;
}) {
  await safeNotify({
    title: "Yeni Mesaj",
    message: `${params.senderName} size yeni bir mesaj gönderdi.`,
    type: "NEW_MESSAGE",
    actionUrl: `/hesabim/mesajlar/${params.senderId}`,
    userId: params.receiverId,
  });
}

export async function getNotifications(limit?: number) {
  const notifications = await prisma.notification.findMany({
    where: adminNotificationWhere,
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  return notifications.map(serializeNotification);
}

export async function getNotificationsPaginated(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: adminNotificationWhere,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: adminNotificationWhere }),
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    total,
  };
}

export async function getUnreadNotificationCount() {
  return prisma.notification.count({
    where: { isRead: false, ...adminNotificationWhere },
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead() {
  return prisma.notification.updateMany({
    where: { isRead: false, ...adminNotificationWhere },
    data: { isRead: true },
  });
}

type UserNotificationQuery = {
  page: number;
  limit: number;
  filter?: AccountNotificationFilter;
  type?: UserNotificationType;
};

function buildUserNotificationWhere(
  userId: string,
  query?: Pick<UserNotificationQuery, "filter" | "type">
): Prisma.NotificationWhereInput {
  const where: Prisma.NotificationWhereInput = {
    ...userNotificationWhere(userId),
    type: { in: [...USER_NOTIFICATION_TYPES] },
  };

  if (query?.filter === "unread") {
    where.isRead = false;
  } else if (query?.filter === "read") {
    where.isRead = true;
  }

  if (query?.type) {
    where.type = query.type;
  }

  return where;
}

export async function getUserNotifications(
  userId: string,
  limit = 5
): Promise<NotificationItem[]> {
  const notifications = await prisma.notification.findMany({
    where: buildUserNotificationWhere(userId),
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications.map(serializeNotification);
}

export async function getUserNotificationsPaginated(
  userId: string,
  query: UserNotificationQuery
) {
  const skip = (query.page - 1) * query.limit;
  const where = buildUserNotificationWhere(userId, query);

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    total,
  };
}

export async function getUserUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: buildUserNotificationWhere(userId, { filter: "unread" }),
  });
}

export async function markUserNotificationRead(userId: string, id: string) {
  const existing = await prisma.notification.findFirst({
    where: { id, ...userNotificationWhere(userId) },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllUserNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: buildUserNotificationWhere(userId, { filter: "unread" }),
    data: { isRead: true },
  });
}

export async function notifyAuthorContentRejected(params: {
  authorId: string;
  title: string;
  contentId: string;
  reviewNote: string;
}) {
  await safeNotify({
    title: "İçeriğiniz Reddedildi",
    message: `"${params.title}" içeriğiniz reddedildi. Not: ${params.reviewNote}`,
    type: "CONTENT_REJECTED",
    actionUrl: `/hesabim/paylasimlar/${params.contentId}/duzenle`,
    userId: params.authorId,
  });
}

export async function notifyAuthorRevisionRequested(params: {
  authorId: string;
  title: string;
  contentId: string;
  reviewNote: string;
}) {
  await safeNotify({
    title: "Revizyon İstendi",
    message: `"${params.title}" için revizyon istendi. Not: ${params.reviewNote}`,
    type: "CONTENT_REVISION_REQUESTED",
    actionUrl: `/hesabim/paylasimlar/${params.contentId}/duzenle`,
    userId: params.authorId,
  });
}

export async function notifyAuthorContentPublished(params: {
  authorId: string;
  title: string;
  contentSlug: string;
  contentType: string;
}) {
  const path =
    params.contentType === "NEWS"
      ? `/haberler/${params.contentSlug}`
      : `/makaleler/${params.contentSlug}`;

  await safeNotify({
    title: "İçeriğiniz Yayınlandı",
    message: `"${params.title}" içeriğiniz yayına alındı.`,
    type: "CONTENT_PUBLISHED",
    actionUrl: path,
    userId: params.authorId,
  });
}
