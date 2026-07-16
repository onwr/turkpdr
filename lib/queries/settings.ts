import { prisma } from "@/lib/prisma";
import {
  defaultSiteSettingsFormState,
  SITE_SETTINGS_ID,
  type SiteSettingsData,
} from "@/types/settings";

const DEFAULT_CREATE_DATA = {
  siteName: defaultSiteSettingsFormState.siteName,
  metaTitle: defaultSiteSettingsFormState.metaTitle,
  metaDescription: defaultSiteSettingsFormState.metaDescription,
  footerText: defaultSiteSettingsFormState.footerText,
};

export function serializeSiteSettings(settings: {
  id: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  footerText: string | null;
  googleAnalyticsId: string | null;
  googleSearchConsoleCode: string | null;
  googleAdsensePublisherId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SiteSettingsData {
  return {
    id: settings.id,
    siteName: settings.siteName,
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    metaTitle: settings.metaTitle,
    metaDescription: settings.metaDescription,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    instagramUrl: settings.instagramUrl,
    twitterUrl: settings.twitterUrl,
    linkedinUrl: settings.linkedinUrl,
    youtubeUrl: settings.youtubeUrl,
    footerText: settings.footerText,
    googleAnalyticsId: settings.googleAnalyticsId,
    googleSearchConsoleCode: settings.googleSearchConsoleCode,
    googleAdsensePublisherId: settings.googleAdsensePublisherId,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function getOrCreateSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: {
      id: SITE_SETTINGS_ID,
      ...DEFAULT_CREATE_DATA,
    },
    update: {},
  });
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const settings = await getOrCreateSiteSettings();
  return serializeSiteSettings(settings);
}
