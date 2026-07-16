import Script from "next/script";

import { getSiteSettings } from "@/lib/queries/settings";

export async function SiteAdsense() {
  const settings = await getSiteSettings();
  const publisherId = settings.googleAdsensePublisherId;

  if (!publisherId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
