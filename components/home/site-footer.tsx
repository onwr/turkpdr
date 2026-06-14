import { Footer, type FooterBranding } from "@/components/home/footer";
import { getSiteSettings } from "@/lib/queries/settings";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  const branding: FooterBranding = {
    siteName: settings.siteName,
    logoUrl: settings.logoUrl,
    footerText: settings.footerText,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    instagramUrl: settings.instagramUrl,
    twitterUrl: settings.twitterUrl,
    linkedinUrl: settings.linkedinUrl,
    youtubeUrl: settings.youtubeUrl,
  };

  return <Footer branding={branding} />;
}
