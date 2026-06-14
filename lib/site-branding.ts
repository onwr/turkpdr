export const DEFAULT_SITE_LOGO_URL = "/logo.png";

export function resolveSiteLogoUrl(
  logoUrl: string | null | undefined
): string {
  const trimmed = logoUrl?.trim();
  return trimmed || DEFAULT_SITE_LOGO_URL;
}

export function resolveSiteIconUrl(settings: {
  faviconUrl?: string | null;
  logoUrl?: string | null;
}): string {
  const favicon = settings.faviconUrl?.trim();
  if (favicon) return favicon;

  return resolveSiteLogoUrl(settings.logoUrl);
}
