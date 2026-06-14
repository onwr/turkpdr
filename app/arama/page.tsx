import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { SearchPage } from "@/components/search/search-page";

export const metadata: Metadata = {
  title: "Arama",
  description:
    "TürkPDR'da makale, haber, dosya, test ve yazarlar arasında arama yapın.",
};

function SearchFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      Arama sayfası yükleniyor...
    </div>
  );
}

export default function AramaPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<SearchFallback />}>
        <SearchPage />
      </Suspense>
      <SiteFooter />
    </>
  );
}
