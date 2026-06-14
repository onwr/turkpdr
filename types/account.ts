import type { ContentStatus, ContentType } from "@prisma/client";

import type { AppContentStatus } from "@/types/content";

import type { NotificationItem } from "@/types/notifications";

export type AccountStats = {
  totalPosts: number;
  pendingPosts: number;
  favorites: number;
  testResults: number;
  messages: number;
  files: number;
};

export type AccountContentItem = {
  id: string;
  title: string;
  slug: string;
  status: AppContentStatus;
  type: ContentType;
  typeLabel: string;
  category: string | null;
  views: number;
  createdAt: string;
  href: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
};

export type AccountFavoriteItem = {
  id: string;
  postId: string;
  title: string;
  slug: string;
  type: ContentType;
  typeLabel: string;
  category: string | null;
  summary: string | null;
  coverImage: string | null;
  savedAt: string;
  href: string;
};

export type AccountTestResultItem = {
  id: string;
  testTitle: string;
  testSlug: string;
  totalScore: number;
  maxScore: number;
  resultLabel: string;
  createdAt: string;
  href: string;
};

export type AccountFileItem = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  downloads: number;
  status: ContentStatus;
  createdAt: string;
};

export type AccountSummary = {
  stats: AccountStats;
  recentPosts: AccountContentItem[];
  recentTestResults: AccountTestResultItem[];
  recentFavorites: AccountFavoriteItem[];
  recentNotifications: NotificationItem[];
  unreadNotifications: number;
  profileCompletion: number;
};

export type AccountProfileData = {
  id: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  avatar: string;
  coverImage: string;
  phone: string;
  city: string;
  website: string;
  workAreas: string[];
  expertiseAreas: string[];
  role: string;
  createdAt: string;
};
