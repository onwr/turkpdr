import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SiteAdsense } from "@/components/home/site-adsense";
import { SiteTracking } from "@/components/home/site-tracking";
import { resolveSiteIconUrl } from "@/lib/site-branding";
import { getSiteSettings } from "@/lib/queries/settings";
import { defaultSiteSettingsFormState } from "@/types/settings";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title =
    settings.metaTitle ?? defaultSiteSettingsFormState.metaTitle;
  const description =
    settings.metaDescription ?? defaultSiteSettingsFormState.metaDescription;
  const siteName = settings.siteName;
  const iconUrl = resolveSiteIconUrl(settings);

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      "psikolojik danışmanlık",
      "rehberlik",
      "PDR",
      "psikoloji testleri",
      "makale",
    ],
    icons: {
      icon: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
    },
    verification: settings.googleSearchConsoleCode
      ? { google: settings.googleSearchConsoleCode }
      : undefined,
    openGraph: {
      title,
      description,
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SiteTracking />
        <SiteAdsense />
      </body>
    </html>
  );
}
