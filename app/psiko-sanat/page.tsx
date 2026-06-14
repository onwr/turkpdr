import type { Metadata } from "next";
import { Suspense } from "react";

import { PsikoSanatListPage } from "@/components/content/psiko-sanat-list-page";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import {
  getPsikoSanatCategories,
  getPublishedPsikoSanat,
} from "@/lib/queries/psiko-sanat";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Psiko Sanat — Kitap, Film ve Sanat | TürkPDR",
  description:
    "Psikoloji, kitap, film ve sanat içeriklerini keşfedin. Psiko Sanat Kitap bölümünde öneriler ve incelemeler.",
  keywords: [
    "psiko sanat",
    "psikoloji kitapları",
    "psikoloji filmleri",
    "sanat ve psikoloji",
    "kitap önerileri",
  ],
  openGraph: {
    title: "Psiko Sanat | TürkPDR",
    description:
      "Kitap, film, sanat ve psikoloji içeriklerini keşfedin.",
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

  const [items, categories] = await Promise.all([
    getPublishedPsikoSanat(search, category),
    getPsikoSanatCategories(),
  ]);

  return (
    <>
      <SiteHeader />
      <Suspense>
        <PsikoSanatListPage
          title="Psiko Sanat Kitap"
          description="Kitap, film, sanat ve psikoloji dünyasından seçilmiş içerikler ve öneriler."
          items={items}
          categories={categories}
          initialSearch={search ?? ""}
          initialCategory={category ?? ""}
          emptyTitle="Henüz içerik yok"
          emptyDescription={
            search || category
              ? "Arama kriterlerinize uygun içerik bulunamadı."
              : "Yayınlanmış Psiko Sanat içeriği bulunmuyor. Yakında yeni içerikler eklenecek."
          }
        />
      </Suspense>
      <SiteFooter />
    </>
  );
}
