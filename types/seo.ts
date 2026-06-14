import { normalizeMediaUrl } from "@/lib/media-url";

export type SeoFieldsForm = {
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noIndex: boolean;
};

export const defaultSeoFields: SeoFieldsForm = {
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  canonicalUrl: "",
  noIndex: false,
};

export type SeoSource = {
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  coverImage?: string | null;
  image?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};

export type ResolvedSeo = {
  title: string;
  description: string;
  ogImage: string | null;
  canonicalUrl: string;
  noIndex: boolean;
};

export function seoFieldsFromRecord(record: {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
}): SeoFieldsForm {
  return {
    seoTitle: record.seoTitle ?? "",
    seoDescription: record.seoDescription ?? "",
    ogImage: record.ogImage ?? "",
    canonicalUrl: record.canonicalUrl ?? "",
    noIndex: record.noIndex ?? false,
  };
}

export function seoFieldsToPayload(fields: SeoFieldsForm) {
  return {
    seoTitle: fields.seoTitle.trim() || null,
    seoDescription: fields.seoDescription.trim() || null,
    ogImage: normalizeMediaUrl(fields.ogImage.trim()) || null,
    canonicalUrl: fields.canonicalUrl.trim() || null,
    noIndex: fields.noIndex,
  };
}
