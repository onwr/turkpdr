import type { NotificationType } from "@prisma/client";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
};

export const USER_NOTIFICATION_TYPES = [
  "CONTENT_PUBLISHED",
  "CONTENT_REJECTED",
  "CONTENT_REVISION_REQUESTED",
  "NEW_COMMENT",
  "NEW_MESSAGE",
  "SYSTEM",
] as const satisfies readonly NotificationType[];

export type UserNotificationType = (typeof USER_NOTIFICATION_TYPES)[number];

export type AccountNotificationFilter = "all" | "unread" | "read";

export const notificationTypeLabels: Record<NotificationType, string> = {
  NEW_COMMENT: "Yorum",
  NEW_USER: "Üye",
  PENDING_CONTENT: "İçerik",
  NEW_FILE: "Dosya",
  CONTENT_PUBLISHED: "Yayın",
  CONTENT_REJECTED: "Red",
  CONTENT_REVISION_REQUESTED: "Revizyon",
  NEW_MESSAGE: "Mesaj",
  SYSTEM: "Sistem",
};

export const userNotificationTypeLabels: Record<UserNotificationType, string> = {
  CONTENT_PUBLISHED: notificationTypeLabels.CONTENT_PUBLISHED,
  CONTENT_REJECTED: notificationTypeLabels.CONTENT_REJECTED,
  CONTENT_REVISION_REQUESTED: notificationTypeLabels.CONTENT_REVISION_REQUESTED,
  NEW_COMMENT: notificationTypeLabels.NEW_COMMENT,
  NEW_MESSAGE: notificationTypeLabels.NEW_MESSAGE,
  SYSTEM: notificationTypeLabels.SYSTEM,
};
