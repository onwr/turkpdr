import type { Metadata } from "next";

import { NewsListPage } from "@/components/content/news-list-page";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { getPublishedNews } from "@/lib/queries/articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Haberler | TürkPDR",
  description: "PDR dünyasından en güncel haberler ve duyurular.",
  openGraph: {
    title: "Haberler | TürkPDR",
    description: "PDR dünyasından en güncel haberler ve duyurular.",
    type: "website",
    locale: "tr_TR",
  },
};

export default async function HaberlerPage() {
  const news = await getPublishedNews();

  return (
    <>
      <SiteHeader />
      <NewsListPage
        title="Haberler"
        description="PDR dünyasından en güncel haberler ve platform duyuruları."
        items={news}
        emptyTitle="Henüz haber yok"
        emptyDescription="Yayınlanmış haber bulunmuyor. Yakında yeni haberler eklenecek."
      />
      <SiteFooter />
    </>
  );
}
