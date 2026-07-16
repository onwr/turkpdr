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

  const value = url.trim();

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

/**
 * Public URL for uploaded files, as a relative `/uploads/...` path.
 * External URLs pass through unchanged. Kept relative so it resolves
 * correctly against whatever origin actually serves the site (next/image
 * only allows external hosts listed in next.config.ts remotePatterns, and
 * a hardcoded production host would 404 on any other environment).
 * For contexts that need an absolute URL (OG/social meta tags), use
 * `toAbsoluteMediaUrl` from lib/seo/metadata.ts on the result.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  return normalizeMediaUrl(url);
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

/**
 * Normalizes uploaded-media URLs inside rich text content to relative
 * `/uploads/...` paths, so they render correctly on whatever origin serves
 * the page (same reasoning as `resolveMediaUrl`).
 */
export function resolveRichTextMediaUrls(
  html: string | null | undefined
): string {
  return normalizeRichTextMediaUrls(html) ?? "";
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
