import type { Metadata } from "next";

import { FilesPage } from "@/components/files/files-page";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { getFilesPageData } from "@/lib/queries/files";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dosya Merkezi — Ücretsiz PDR Materyalleri | TürkPDR",
  description:
    "Rehberlik formları, test materyalleri ve eğitim dokümanlarını ücretsiz indirin.",
  keywords: [
    "PDR dosyaları",
    "rehberlik formları",
    "psikolojik test materyalleri",
    "eğitim dokümanları",
    "ücretsiz indirme",
  ],
  openGraph: {
    title: "TürkPDR Dosya Merkezi",
    description:
      "Rehberlik formları, test materyalleri ve eğitim dokümanlarını ücretsiz indirin.",
    type: "website",
    locale: "tr_TR",
  },
};

export default async function Page() {
  const { files, categories } = await getFilesPageData();

  return (
    <>
      <SiteHeader />
      <FilesPage files={files} categories={categories} />
      <SiteFooter />
    </>
  );
}
