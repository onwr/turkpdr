import type {
  ContentStatus,
  ContentType,
  UserRole,
  UserStatus,
} from "@prisma/client";

import type { NotificationItem } from "@/types/notifications";
import type { ActivityLogItem } from "@/types/activity";

export type AdminNavItem = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "analytics"
    | "activity"
    | "content"
    | "categories"
    | "news"
    | "articles"
    | "files"
    | "videos"
    | "tests"
    | "authors"
    | "members"
    | "comments"
    | "settings"
    | "dictionary"
    | "psikoSanat"
    | "media"
    | "trash";
};

export type AdminStat = {
  id: string;
  label: string;
  value: number;
  change?: string;
  icon:
    | "members"
    | "articles"
    | "news"
    | "files"
    | "videos"
    | "pending";
};

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: "article" | "news" | "file" | "test" | "dictionary";
};

export type AdminUser = {
  name: string;
  role: string;
  avatar: string;
};

export type DashboardPendingItem = {
  id: string;
  entityType: "content" | "file";
  title: string;
  typeLabel: string;
  author: string;
  date: string;
  status: ContentStatus;
  editUrl: string;
  assignedEditor: { id: string; name: string } | null;
};

export type DashboardLatestContent = {
  id: string;
  title: string;
  typeLabel: string;
  author: string;
  date: string;
  editUrl: string;
};

export type DashboardMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  createdAt: string;
};

export type DashboardComment = {
  id: string;
  content: string;
  userName: string;
  postTitle: string;
  postId: string;
  createdAt: string;
  postViewUrl: string | null;
};

export type DashboardFile = {
  id: string;
  title: string;
  uploadedBy: string;
  fileType: string | null;
  createdAt: string;
  status: ContentStatus;
  editUrl: string;
};

export type AdminDashboardData = {
  stats: AdminStat[];
  pendingItems: DashboardPendingItem[];
  latestContents: DashboardLatestContent[];
  latestMembers: DashboardMember[];
  latestComments: DashboardComment[];
  latestFiles: DashboardFile[];
  notifications: NotificationItem[];
  latestActivities: ActivityLogItem[];
};

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  createdAt: string;
  contentCount: number;
};

export type AdminUserDetail = AdminUserListItem & {
  title: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  website: string | null;
  commentCount: number;
  fileCount: number;
};

export type AdminAuthorItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string | null;
  bio: string | null;
  avatar: string | null;
  expertiseAreas: string[];
  workAreas: string[];
  contentCount: number;
};

export type AdminCommentItem = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null };
  post: { id: string; title: string; slug: string; type: ContentType };
};

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: "Yönetici",
  EDITOR: "Editör",
  AUTHOR: "Yazar",
  MEMBER: "Üye",
};

export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: "Aktif",
  PASSIVE: "Pasif",
  BANNED: "Yasaklı",
};

export const userRoleStyles: Record<UserRole, string> = {
  ADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
  EDITOR: "bg-sky-50 text-sky-700 ring-sky-200",
  AUTHOR: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  MEMBER: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const userStatusStyles: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PASSIVE: "bg-amber-50 text-amber-700 ring-amber-200",
  BANNED: "bg-red-50 text-red-700 ring-red-200",
};
