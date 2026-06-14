import type { DictionaryStatus } from "@prisma/client";

import { createSlug } from "@/lib/admin/content-utils";
import { prisma } from "@/lib/prisma";
import { seoFieldsToPayload } from "@/types/seo";
import type { SeoFieldsForm } from "@/types/seo";

export async function generateUniqueDictionarySlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = createSlug(title) || "terim";
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.dictionaryTerm.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

export function serializeDictionaryTerm(term: {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string | null;
  category: string | null;
  status: DictionaryStatus;
  views: number;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: term.id,
    title: term.title,
    slug: term.slug,
    shortDescription: term.shortDescription,
    content: term.content,
    category: term.category,
    status: term.status,
    views: term.views,
    seoTitle: term.seoTitle,
    seoDescription: term.seoDescription,
    ogImage: term.ogImage,
    canonicalUrl: term.canonicalUrl,
    noIndex: term.noIndex,
    scheduledAt: term.scheduledAt?.toISOString() ?? null,
    createdAt: term.createdAt.toISOString(),
    updatedAt: term.updatedAt.toISOString(),
  };
}

export type DictionaryInput = {
  title?: string;
  shortDescription?: string | null;
  content?: string | null;
  category?: string | null;
  status?: DictionaryStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  scheduledAt?: string | null;
  seo?: SeoFieldsForm;
};

export function extractDictionarySeoPayload(body: DictionaryInput) {
  if (body.seo) {
    return seoFieldsToPayload(body.seo);
  }

  if (
    body.seoTitle !== undefined ||
    body.seoDescription !== undefined ||
    body.ogImage !== undefined ||
    body.canonicalUrl !== undefined ||
    body.noIndex !== undefined
  ) {
    return seoFieldsToPayload({
      seoTitle: body.seoTitle ?? "",
      seoDescription: body.seoDescription ?? "",
      ogImage: body.ogImage ?? "",
      canonicalUrl: body.canonicalUrl ?? "",
      noIndex: body.noIndex ?? false,
    });
  }

  return null;
}

export function validateDictionaryInput(
  body: DictionaryInput,
  isCreate = false
): string | null {
  if (isCreate && !body.title?.trim()) {
    return "Terim başlığı zorunludur.";
  }
  if (body.title !== undefined && !body.title.trim()) {
    return "Terim başlığı boş olamaz.";
  }
  const validStatuses: DictionaryStatus[] = ["DRAFT", "PUBLISHED"];
  if (body.status && !validStatuses.includes(body.status)) {
    return "Geçersiz terim durumu.";
  }
  return null;
}
