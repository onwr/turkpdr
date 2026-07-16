import type { ContentType } from "@prisma/client";

export type ProfileTab = "posts" | "files" | "favorites";

export type UserProfile = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  about: string;
  workAreas: string[];
  expertiseAreas: string[];
  totalPosts: number;
  totalFiles: number;
  totalLikes: number;
  joinedAt: string;
  joinedDate: string;
  email: string;
  phone?: string;
  city: string;
  website?: string;
  seoTitle: string;
  seoDescription: string;
};

export type ProfilePost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  type: "makale" | "haber";
  contentType: ContentType;
  slug: string;
  date: string;
  likeCount: number;
  coverImage: string;
};

export type ProfileFile = {
  id: string;
  name: string;
  category: string;
  downloadCount: number;
  fileType: string;
  slug: string;
  date: string;
};

export type ProfileFavorite = {
  id: string;
  title: string;
  type: "makale" | "haber" | "dosya" | "test";
  contentType: ContentType;
  slug: string;
  savedAt: string;
};

export type PopularContent = {
  id: string;
  title: string;
  type: string;
  contentType: ContentType;
  slug: string;
  viewCount: number;
};
