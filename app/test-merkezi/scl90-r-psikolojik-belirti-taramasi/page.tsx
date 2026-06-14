import type { Metadata } from "next";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { Scl90rPage } from "@/components/tests/scl90r/scl90r-page";

export const metadata: Metadata = {
  title: "SCL90-R Psikolojik Belirti Taraması",
  description:
    "SCL90-R ile psikolojik belirti düzeylerini değerlendirin. 90 maddelik tarama ölçeği; alt ölçek puanları ve Genel Semptom İndeksi. Tanı koymaz, bilgilendirme amaçlıdır.",
};

export default function Scl90rPsikolojikBelirtiTaramasiPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <Scl90rPage />
      </main>
      <SiteFooter />
    </>
  );
}
