import type { Metadata } from "next";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { RiverCrossingPage } from "@/components/tests/river-crossing/river-crossing-page";

export const metadata: Metadata = {
  title: "Nehirden Geçirme Zeka Testi",
  description:
    "Kurallara uyarak aile bireylerini, polisi ve hırsızı nehrin karşısına geçirmeye çalıştığınız interaktif zeka testi.",
};

export default function NehirdenGecirmeZekaTestiPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <RiverCrossingPage />
      </main>
      <SiteFooter />
    </>
  );
}
