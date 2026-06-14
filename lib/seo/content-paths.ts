import type { ContentType } from "@prisma/client";

const SEO_PATH_MAP: Partial<Record<ContentType, string>> = {
  ARTICLE: "/makaleler",
  GUIDE: "/makaleler",
  METAPHOR: "/makaleler",
  NEWS: "/haberler",
  PSIKO_SANAT: "/psiko-sanat",
  VIDEO: "/videolar",
};

const SEO_SUFFIX_MAP: Partial<Record<ContentType, string>> = {
  ARTICLE: " | TürkPDR",
  GUIDE: " | TürkPDR",
  METAPHOR: " | TürkPDR",
  NEWS: " | Haberler | TürkPDR",
  PSIKO_SANAT: " | Psiko Sanat | TürkPDR",
  VIDEO: " | Videolar | TürkPDR",
};

export function getContentSeoPreviewPath(type: ContentType): string {
  return SEO_PATH_MAP[type] ?? "/makaleler";
}

export function getContentSeoTitleSuffix(type: ContentType): string {
  return SEO_SUFFIX_MAP[type] ?? " | TürkPDR";
}
