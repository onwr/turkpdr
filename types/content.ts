import type { ContentStatus, ContentType } from "@prisma/client";

import { defaultSeoFields, type SeoFieldsForm } from "@/types/seo";

export type AppContentStatus =
  | "DRAFT"
  | "PENDING"
  | "PUBLISHED"
  | "REJECTED"
  | "REVISION_REQUESTED";

export const APP_CONTENT_STATUSES: AppContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "REVISION_REQUESTED",
];

export function toAppContentStatus(status: ContentStatus): AppContentStatus {
  return status as AppContentStatus;
}

export function toPrismaContentStatus(status: AppContentStatus): ContentStatus {
  return status as ContentStatus;
}

export type ContentFormState = {
  title: string;
  summary: string;
  categoryId: string;
  type: ContentType;
  coverImage: string | null;
  tags: string[];
  status: AppContentStatus;
  featured: boolean;
  scheduledAt: string;
  seo: SeoFieldsForm;
};

export const defaultContentFormState: ContentFormState = {
  title: "",
  summary: "",
  categoryId: "",
  type: "ARTICLE",
  coverImage: null,
  tags: [],
  status: "DRAFT",
  featured: false,
  scheduledAt: "",
  seo: { ...defaultSeoFields },
};

export type ContentListItem = {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  status: AppContentStatus;
  featured: boolean;
  views: number;
  createdAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  reviewNote: string | null;
  assignedEditorId: string | null;
  author: { id: string; name: string };
  category: { id: string; name: string } | null;
  tags: { id: string; name: string }[];
  assignedEditor: { id: string; name: string } | null;
};

export type ContentDetail = ContentFormState & {
  id: string;
  slug: string;
  content: string | null;
};

export const contentTypeLabels: Record<ContentType, string> = {
  NEWS: "Haber",
  ARTICLE: "Makale",
  GUIDE: "Rehberlik Yazısı",
  METAPHOR: "Terapi Metaforu",
  PSIKO_SANAT: "Psiko Sanat Kitap",
  VIDEO: "Video",
  FILE: "Dosya",
};

export const contentStatusLabels: Record<AppContentStatus, string> = {
  DRAFT: "Taslak",
  PENDING: "Onay Bekliyor",
  PUBLISHED: "Yayında",
  REJECTED: "Reddedildi",
  REVISION_REQUESTED: "Revizyon İstendi",
};

export const contentStatusStyles: Record<AppContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  REVISION_REQUESTED: "bg-orange-50 text-orange-700 ring-orange-200",
};
