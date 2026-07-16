import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/hesabim", "/api", "/giris", "/kayit"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
