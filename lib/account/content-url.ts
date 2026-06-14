import type { ContentType } from "@prisma/client";

const TYPE_LABELS: Record<ContentType, string> = {
  NEWS: "Haber",
  ARTICLE: "Makale",
  GUIDE: "Rehber",
  METAPHOR: "Metafor",
  PSIKO_SANAT: "Psiko Sanat",
  VIDEO: "Video",
  FILE: "Dosya",
};

export function getContentTypeLabel(type: ContentType): string {
  return TYPE_LABELS[type] ?? "İçerik";
}

export function getPublishedContentHref(
  type: ContentType,
  slug: string
): string | null {
  switch (type) {
    case "NEWS":
      return `/haberler/${slug}`;
    case "ARTICLE":
    case "GUIDE":
    case "METAPHOR":
      return `/makaleler/${slug}`;
    case "PSIKO_SANAT":
      return `/psiko-sanat/${slug}`;
    case "VIDEO":
      return `/videolar/${slug}`;
    case "FILE":
      return `/dosyalar`;
    default:
      return null;
  }
}

export function getFavoriteHref(type: ContentType, slug: string): string {
  return getPublishedContentHref(type, slug) ?? `/makaleler/${slug}`;
}
