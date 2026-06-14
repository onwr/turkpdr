import type { ContentStatus } from "@prisma/client";

import { seoFieldsToPayload } from "@/types/seo";
import type { SeoFieldsForm } from "@/types/seo";

export function serializeAdminTest(test: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  duration: string | null;
  questionCount: number | null;
  iframeUrl: string | null;
  status: ContentStatus;
  categoryId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string } | null;
}) {
  return {
    id: test.id,
    title: test.title,
    slug: test.slug,
    description: test.description,
    image: test.image,
    duration: test.duration,
    questionCount: test.questionCount,
    iframeUrl: test.iframeUrl,
    status: test.status,
    categoryId: test.categoryId,
    seoTitle: test.seoTitle,
    seoDescription: test.seoDescription,
    ogImage: test.ogImage,
    canonicalUrl: test.canonicalUrl,
    noIndex: test.noIndex,
    scheduledAt: test.scheduledAt?.toISOString() ?? null,
    category: test.category,
    createdAt: test.createdAt.toISOString(),
    updatedAt: test.updatedAt.toISOString(),
  };
}

export type TestInput = {
  title?: string;
  description?: string | null;
  image?: string | null;
  duration?: string | null;
  questionCount?: number | null;
  iframeUrl?: string | null;
  status?: ContentStatus;
  categoryId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  scheduledAt?: string | null;
  seo?: SeoFieldsForm;
};

export function extractTestSeoPayload(body: TestInput) {
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
