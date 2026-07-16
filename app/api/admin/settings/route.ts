import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/api-auth";
import { normalizeMediaUrl } from "@/lib/media-url";
import {
  getOrCreateSiteSettings,
  serializeSiteSettings,
} from "@/lib/queries/settings";
import { prisma } from "@/lib/prisma";
import { SITE_SETTINGS_ID } from "@/types/settings";

type SettingsInput = {
  siteName?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  footerText?: string | null;
  googleAnalyticsId?: string | null;
  googleSearchConsoleCode?: string | null;
  googleAdsensePublisherId?: string | null;
};

function normalizeOptional(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Accepts "1234567890", "pub-1234567890" or "ca-pub-1234567890" and stores the canonical "ca-pub-..." form. */
function normalizeAdsensePublisherId(
  value: string | null | undefined
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("ca-pub-")) return trimmed;
  if (trimmed.startsWith("pub-")) return `ca-${trimmed}`;
  return `ca-pub-${trimmed}`;
}

function validateSettingsInput(body: SettingsInput): string | null {
  if (body.siteName !== undefined && !body.siteName.trim()) {
    return "Site adı boş olamaz.";
  }
  if (body.contactEmail !== undefined && body.contactEmail?.trim()) {
    const email = body.contactEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Geçerli bir iletişim e-postası girin.";
    }
  }
  return null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const settings = await getOrCreateSiteSettings();

  return NextResponse.json({
    settings: serializeSiteSettings(settings),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  let body: SettingsInput;
  try {
    body = (await request.json()) as SettingsInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateSettingsInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  await getOrCreateSiteSettings();

  const updateData: {
    siteName?: string;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    footerText?: string | null;
    googleAnalyticsId?: string | null;
    googleSearchConsoleCode?: string | null;
    googleAdsensePublisherId?: string | null;
  } = {};

  if (body.siteName !== undefined) updateData.siteName = body.siteName.trim();
  if (body.logoUrl !== undefined) {
    updateData.logoUrl = normalizeMediaUrl(normalizeOptional(body.logoUrl));
  }
  if (body.faviconUrl !== undefined) {
    updateData.faviconUrl = normalizeMediaUrl(normalizeOptional(body.faviconUrl));
  }
  if (body.metaTitle !== undefined) {
    updateData.metaTitle = normalizeOptional(body.metaTitle);
  }
  if (body.metaDescription !== undefined) {
    updateData.metaDescription = normalizeOptional(body.metaDescription);
  }
  if (body.contactEmail !== undefined) {
    updateData.contactEmail = normalizeOptional(body.contactEmail);
  }
  if (body.contactPhone !== undefined) {
    updateData.contactPhone = normalizeOptional(body.contactPhone);
  }
  if (body.instagramUrl !== undefined) {
    updateData.instagramUrl = normalizeOptional(body.instagramUrl);
  }
  if (body.twitterUrl !== undefined) {
    updateData.twitterUrl = normalizeOptional(body.twitterUrl);
  }
  if (body.linkedinUrl !== undefined) {
    updateData.linkedinUrl = normalizeOptional(body.linkedinUrl);
  }
  if (body.youtubeUrl !== undefined) {
    updateData.youtubeUrl = normalizeOptional(body.youtubeUrl);
  }
  if (body.footerText !== undefined) {
    updateData.footerText = normalizeOptional(body.footerText);
  }
  if (body.googleAnalyticsId !== undefined) {
    updateData.googleAnalyticsId = normalizeOptional(body.googleAnalyticsId);
  }
  if (body.googleSearchConsoleCode !== undefined) {
    updateData.googleSearchConsoleCode = normalizeOptional(
      body.googleSearchConsoleCode
    );
  }
  if (body.googleAdsensePublisherId !== undefined) {
    updateData.googleAdsensePublisherId = normalizeAdsensePublisherId(
      body.googleAdsensePublisherId
    );
  }

  const settings = await prisma.siteSettings.update({
    where: { id: SITE_SETTINGS_ID },
    data: updateData,
  });

  return NextResponse.json({
    settings: serializeSiteSettings(settings),
    message: "Site ayarları güncellendi.",
  });
}
