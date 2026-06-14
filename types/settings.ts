export const SITE_SETTINGS_ID = "default";

export type SiteSettingsData = {
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
  createdAt: string;
  updatedAt: string;
};

export type SiteSettingsFormState = {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  metaTitle: string;
  metaDescription: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerText: string;
  googleAnalyticsId: string;
  googleSearchConsoleCode: string;
};

export const defaultSiteSettingsFormState: SiteSettingsFormState = {
  siteName: "TürkPDR",
  logoUrl: "",
  faviconUrl: "",
  metaTitle:
    "TürkPDR — Türkiye'nin En Büyük Psikolojik Danışmanlık Platformu",
  metaDescription:
    "Psikolojik danışmanlar, rehber öğretmenler, öğrenciler ve uzmanlar için makale, test, dosya ve eğitim merkezi.",
  contactEmail: "",
  contactPhone: "",
  instagramUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  footerText:
    "Türkiye'nin en kapsamlı psikolojik danışmanlık ve rehberlik platformu.",
  googleAnalyticsId: "",
  googleSearchConsoleCode: "",
};
