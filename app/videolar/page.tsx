import type { Metadata } from "next";

import { ContentListPage } from "@/components/content/content-list-page";
import { getPublishedVideos } from "@/lib/queries/videos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Videolar",
  description:
    "Psikolojik danışmanlık ve rehberlik alanında eğitim videoları ve içerikler.",
  openGraph: {
    title: "Videolar | TürkPDR",
    description:
      "Psikolojik danışmanlık ve rehberlik alanında eğitim videoları.",
    type: "website",
    locale: "tr_TR",
  },
};

export default async function VideolarPage() {
  const videos = await getPublishedVideos();

  return (
    <ContentListPage
      title="Videolar"
      description="PDR alanında eğitim videoları, seminer kayıtları ve görsel içerikler."
      items={videos}
      basePath="/videolar"
      emptyTitle="Henüz video yok"
      emptyDescription="Yayınlanmış video içeriği bulunmuyor. Yakında yeni videolar eklenecek."
    />
  );
}
