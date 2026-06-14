import type { ContentStatus, ContentType } from "@prisma/client";
import slugify from "slugify";

import { prisma } from "@/lib/prisma";
import { toAppContentStatus } from "@/types/content";
import { normalizeContentMediaInput } from "@/lib/media-url";
import { seoFieldsToPayload } from "@/types/seo";

export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: "tr" });
}

export async function generateUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = createSlug(title) || "icerik";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.content.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function syncContentTags(contentId: string, tagNames: string[]) {
  await prisma.contentTag.deleteMany({ where: { contentId } });

  const uniqueTags = [
    ...new Set(tagNames.map((t) => t.trim()).filter(Boolean)),
  ];

  for (const name of uniqueTags) {
    const tagSlug = createSlug(name);
    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: { name },
      create: { name, slug: tagSlug },
    });

    await prisma.contentTag.create({
      data: { contentId, tagId: tag.id },
    });
  }
}

export type ContentInput = {
  title?: string;
  summary?: string | null;
  content?: string | null;
  coverImage?: string | null;
  type?: ContentType;
  status?: ContentStatus;
  featured?: boolean;
  categoryId?: string | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  scheduledAt?: string | null;
};

export function extractSeoPayload(body: ContentInput) {
  return seoFieldsToPayload({
    seoTitle: body.seoTitle ?? "",
    seoDescription: body.seoDescription ?? "",
    ogImage: body.ogImage ?? "",
    canonicalUrl: body.canonicalUrl ?? "",
    noIndex: body.noIndex ?? false,
  });
}

export function prepareContentInputForStorage(body: ContentInput): ContentInput {
  return normalizeContentMediaInput(body);
}

export function validateContentInput(
  body: ContentInput,
  isCreate = false
): string | null {
  if (isCreate && !body.title?.trim()) {
    return "Başlık alanı zorunludur.";
  }
  if (body.title !== undefined && !body.title.trim()) {
    return "Başlık boş olamaz.";
  }
  const validTypes: ContentType[] = [
    "NEWS",
    "ARTICLE",
    "GUIDE",
    "METAPHOR",
    "PSIKO_SANAT",
    "VIDEO",
    "FILE",
  ];
  const validStatuses: ContentStatus[] = [
    "DRAFT",
    "PENDING",
    "PUBLISHED",
    "REJECTED",
    "REVISION_REQUESTED",
  ];

  if (body.type && !validTypes.includes(body.type)) {
    return "Geçersiz içerik türü.";
  }
  if (body.status && !validStatuses.includes(body.status)) {
    return "Geçersiz içerik durumu.";
  }
  return null;
}

export function isRichContentEmpty(html: string | null | undefined): boolean {
  if (!html?.trim()) return true;

  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length === 0;
}

export const contentInclude = {
  author: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, slug: true, type: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  reviewedBy: { select: { id: true, name: true } },
  assignedEditor: { select: { id: true, name: true } },
} as const;

export function serializeContent(content: {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  type: ContentType;
  status: ContentStatus;
  featured: boolean;
  views: number;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  categoryId: string | null;
  authorId: string;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  reviewNote: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  assignedEditorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; email?: string };
  category: { id: string; name: string; slug: string; type: ContentType } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
  reviewedBy: { id: string; name: string } | null;
  assignedEditor: { id: string; name: string } | null;
}) {
  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    summary: content.summary,
    content: content.content,
    coverImage: content.coverImage,
    type: content.type,
    status: toAppContentStatus(content.status),
    featured: content.featured,
    views: content.views,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    ogImage: content.ogImage,
    canonicalUrl: content.canonicalUrl,
    noIndex: content.noIndex,
    categoryId: content.categoryId,
    authorId: content.authorId,
    reviewNote: content.reviewNote,
    reviewedById: content.reviewedById,
    reviewedAt: content.reviewedAt?.toISOString() ?? null,
    assignedEditorId: content.assignedEditorId,
    reviewedBy: content.reviewedBy,
    assignedEditor: content.assignedEditor,
    publishedAt: content.publishedAt?.toISOString() ?? null,
    scheduledAt: content.scheduledAt?.toISOString() ?? null,
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt.toISOString(),
    author: content.author,
    category: content.category,
    tags: content.tags.map((t) => t.tag),
  };
}
