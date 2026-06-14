import { Header, type HeaderBranding } from "@/components/home/header";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries/settings";

export async function SiteHeader() {
  const [settings, user] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
  ]);

  const branding: HeaderBranding = {
    siteName: settings.siteName,
    logoUrl: settings.logoUrl ?? undefined,
  };

  return <Header branding={branding} user={user} />;
}
