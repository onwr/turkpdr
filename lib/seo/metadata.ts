import type { Metadata } from "next";

import type { ResolvedSeo, SeoSource } from "@/types/seo";

export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://turkpdr.com"
  );
}

type ResolveSeoDefaults = {
  titleSuffix: string;
  path: string;
  descriptionFallback?: string;
  defaultImage?: string | null;
};

export function resolveSeo(
  source: SeoSource,
  defaults: ResolveSeoDefaults
): ResolvedSeo {
  const baseUrl = getSiteBaseUrl();

  return {
    title:
      source.seoTitle?.trim() ||
      `${source.title.trim()}${defaults.titleSuffix}`,
    description:
      source.seoDescription?.trim() ||
      source.summary?.trim() ||
      source.description?.trim() ||
      source.shortDescription?.trim() ||
      defaults.descriptionFallback ||
      source.title.trim(),
    ogImage:
      source.ogImage?.trim() ||
      source.coverImage?.trim() ||
      source.image?.trim() ||
      defaults.defaultImage?.trim() ||
      null,
    canonicalUrl: source.canonicalUrl?.trim() || `${baseUrl}${defaults.path}`,
    noIndex: source.noIndex ?? false,
  };
}

type BuildPageMetadataOptions = {
  keywords?: string[];
  authors?: { name: string }[];
  type?: "article" | "website";
  publishedTime?: string;
};

export function buildPageMetadata(
  seo: ResolvedSeo,
  options?: BuildPageMetadataOptions
): Metadata {
  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    ...(options?.keywords?.length ? { keywords: options.keywords } : {}),
    ...(options?.authors?.length ? { authors: options.authors } : {}),
    ...(seo.noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
    alternates: {
      canonical: seo.canonicalUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: options?.type ?? "article",
      locale: "tr_TR",
      url: seo.canonicalUrl,
      ...(options?.publishedTime
        ? { publishedTime: options.publishedTime }
        : {}),
      ...(options?.authors?.length
        ? { authors: options.authors.map((author) => author.name) }
        : {}),
      ...(seo.ogImage
        ? {
            images: [
              {
                url: seo.ogImage,
                width: 1200,
                height: 630,
                alt: seo.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };

  return metadata;
}

export function resolveContentSeo(
  content: SeoSource & {
    summary?: string | null;
    coverImage?: string | null;
  },
  pathPrefix: string,
  titleSuffix: string,
  descriptionFallback?: string
): ResolvedSeo {
  return resolveSeo(content, {
    titleSuffix,
    path: `${pathPrefix}/${content.slug}`,
    descriptionFallback,
    defaultImage: content.coverImage ?? null,
  });
}
