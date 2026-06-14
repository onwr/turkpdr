import { getSiteBaseUrl } from "@/lib/seo/metadata";

const UPLOAD_SEGMENT = /\/uploads\/(?:images|files|videos)\/[^/\s"'<>#?]+/g;
const UPLOAD_PATH = /^\/uploads\/(?:images|files|videos)\//;

export function isUploadMediaPath(url: string | null | undefined): boolean {
  const normalized = normalizeMediaUrl(url);
  return normalized !== null && UPLOAD_PATH.test(normalized);
}

/**
 * Storage format: always a relative `/uploads/...` path for uploaded media.
 * Strips localhost/production hosts and fixes duplicated URL strings.
 */
export function normalizeMediaUrl(
  url: string | null | undefined
): string | null {
  if (!url?.trim()) return null;

  let value = url.trim();

  if (/https?:\/\//i.test(value) || value.includes("/uploads/")) {
    const stripped = value.replace(/https?:\/\/[^/]+/gi, "");
    const matches = stripped.match(UPLOAD_SEGMENT);
    if (matches?.length) {
      return matches[matches.length - 1]!;
    }
  }

  const bareMatch = value.match(
    /uploads\/(?:images|files|videos)\/[^\s"'<>]+/
  );
  if (bareMatch) {
    return `/${bareMatch[0]}`;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (UPLOAD_PATH.test(parsed.pathname)) {
        return parsed.pathname;
      }
    } catch {
      return value;
    }
  }

  if (value.startsWith("/")) {
    return value;
  }

  return value;
}

/** Public absolute URL for uploaded files; external URLs pass through. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  const normalized = normalizeMediaUrl(url);
  if (!normalized) return null;

  if (UPLOAD_PATH.test(normalized)) {
    return `${getSiteBaseUrl()}${normalized}`;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return `${getSiteBaseUrl()}${normalized}`;
  }

  return normalized;
}

export function resolveMediaUrlWithFallback(
  url: string | null | undefined,
  fallback: string
): string {
  return resolveMediaUrl(url) ?? fallback;
}

export function normalizeRichTextMediaUrls(
  html: string | null | undefined
): string | null {
  if (html == null) return null;
  if (!html.trim()) return html;

  let result = html.replace(
    /https?:\/\/[^"'\s>]*\/uploads\/(images|files|videos)\/[^"'\s<>]+/gi,
    (match) => {
      const path = match.match(UPLOAD_SEGMENT);
      return path ? path[path.length - 1]! : match;
    }
  );

  result = result.replace(
    /(\s(?:src|href|data-url)\s*=\s*["'])([^"']+)(['"])/gi,
    (full, prefix: string, attrValue: string, suffix: string) => {
      if (!attrValue.includes("/uploads/") && !attrValue.includes("uploads/")) {
        return full;
      }
      const normalized = normalizeMediaUrl(attrValue);
      return normalized ? `${prefix}${normalized}${suffix}` : full;
    }
  );

  return result;
}

export function resolveRichTextMediaUrls(
  html: string | null | undefined
): string {
  if (!html?.trim()) return html ?? "";

  const baseUrl = getSiteBaseUrl();

  return html.replace(
    /(\s(?:src|href)\s*=\s*["'])(\/uploads\/[^"']+)(['"])/gi,
    (_full, prefix: string, path: string, suffix: string) =>
      `${prefix}${baseUrl}${path}${suffix}`
  );
}

export function normalizeContentMediaInput<T extends {
  coverImage?: string | null;
  content?: string | null;
  ogImage?: string | null;
}>(input: T): T {
  return {
    ...input,
    ...(input.coverImage !== undefined
      ? { coverImage: normalizeMediaUrl(input.coverImage) }
      : {}),
    ...(input.content !== undefined
      ? { content: normalizeRichTextMediaUrls(input.content) }
      : {}),
    ...(input.ogImage !== undefined
      ? { ogImage: normalizeMediaUrl(input.ogImage) }
      : {}),
  };
}
