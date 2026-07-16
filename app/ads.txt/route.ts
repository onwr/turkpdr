import { NextResponse } from "next/server";

import { getSiteSettings } from "@/lib/queries/settings";

/** Google's fixed certification authority ID for AdSense/Ad Manager — same for every publisher. */
const GOOGLE_CERT_AUTHORITY_ID = "f08c47fec0942fa0";

export async function GET() {
  const settings = await getSiteSettings();
  const publisherId = settings.googleAdsensePublisherId;

  if (!publisherId) {
    return new NextResponse("", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // ads.txt uses the bare "pub-..." form, unlike the "ca-pub-..." form used in the ad script tag.
  const bareId = publisherId.replace(/^ca-/, "");

  return new NextResponse(
    `google.com, ${bareId}, DIRECT, ${GOOGLE_CERT_AUTHORITY_ID}\n`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
