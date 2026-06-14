import type { Metadata } from "next";
import { Suspense } from "react";

import { DictionaryPage } from "@/components/dictionary/dictionary-page";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { getDictionaryPageData } from "@/lib/queries/dictionary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PDR Sözlüğü — Psikoloji Terimleri | TürkPDR",
  description:
    "Psikoloji ve rehberlik alanındaki terimlerin alfabetik sözlüğü. Klinik psikoloji, terapi ve eğitim terimlerini keşfedin.",
  keywords: [
    "PDR sözlüğü",
    "psikoloji terimleri",
    "rehberlik terimleri",
    "klinik psikoloji",
    "terapi terimleri",
  ],
  openGraph: {
    title: "TürkPDR PDR Sözlüğü",
    description:
      "Psikoloji ve rehberlik alanındaki terimlerin alfabetik sözlüğü.",
    type: "website",
    locale: "tr_TR",
  },
};

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q?.trim();
  const category = params.category?.trim();

  const { groups, categories } = await getDictionaryPageData(search, category);

  return (
    <>
      <SiteHeader />
      <Suspense>
        <DictionaryPage
          groups={groups}
          categories={categories}
          initialSearch={search ?? ""}
          initialCategory={category ?? ""}
        />
      </Suspense>
      <SiteFooter />
    </>
  );
}
