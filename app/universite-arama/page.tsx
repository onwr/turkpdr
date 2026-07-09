import type { Metadata } from "next";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { UniversitySearchPage } from "@/components/university-search/university-search-page";

export const metadata: Metadata = {
  title: "Üniversite Arama Motoru",
  description:
    "YÖK Atlas verileriyle üniversite ve bölüm arama motoru. Taban puanı, başarı sırası ve kontenjan bilgilerine göre filtreleyin.",
};

export default function UniversiteAramaPage() {
  return (
    <>
      <SiteHeader />
      <UniversitySearchPage />
      <SiteFooter />
    </>
  );
}
