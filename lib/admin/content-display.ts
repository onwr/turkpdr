import type { ContentType } from "@prisma/client";

import { contentStatusLabels, type AppContentStatus } from "@/types/content";

const typePathMap: Partial<Record<ContentType, string>> = {
  ARTICLE: "/makaleler",
  NEWS: "/haberler",
  GUIDE: "/makaleler",
  METAPHOR: "/makaleler",
  PSIKO_SANAT: "/psiko-sanat",
  VIDEO: "/videolar",
};

export function getContentViewUrl(type: ContentType, slug: string): string | null {
  const base = typePathMap[type];
  if (!base) return null;
  return `${base}/${slug}`;
}

export function formatContentDate(date: string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getContentEditUrl(type: ContentType, id: string): string {
  switch (type) {
    case "NEWS":
      return `/admin/news/${id}/edit`;
    case "PSIKO_SANAT":
      return `/admin/psiko-sanat/${id}/edit`;
    default:
      return `/admin/contents/${id}/edit`;
  }
}

export function getFileEditUrl(id: string): string {
  return `/admin/files/${id}/edit`;
}

export function getContentStatusConfirmMessage(
  title: string,
  status: AppContentStatus
): { title: string; description: string; variant?: "default" | "destructive" } {
  const label = contentStatusLabels[status].toLowerCase();

  if (status === "REJECTED") {
    return {
      title: "İçeriği Reddet",
      description: `"${title}" içeriğini reddetmek istediğinize emin misiniz?`,
      variant: "destructive",
    };
  }

  if (status === "REVISION_REQUESTED") {
    return {
      title: "Revizyon İste",
      description: `"${title}" için revizyon istemek üzeresiniz.`,
    };
  }

  if (status === "PUBLISHED") {
    return {
      title: "İçeriği Yayınla",
      description: `"${title}" içeriğini yayınlamak istediğinize emin misiniz?`,
    };
  }

  return {
    title: "Durumu Güncelle",
    description: `"${title}" içeriğini ${label} durumuna almak istediğinize emin misiniz?`,
  };
}
