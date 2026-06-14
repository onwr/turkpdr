import type { Metadata } from "next";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { ReflexTestContent } from "@/components/tests/reflex/reflex-test-content";

export const metadata: Metadata = {
  title: "Kırmızı Kare Refleks Testi",
  description:
    "Dikkatini, refleksini ve odaklanma süreni ölçen interaktif beceri testi. Kırmızı kareyi kontrol ederek mavi engellere çarpmadan ne kadar dayanabileceğini keşfet.",
};

export default function KirmiziKareRefleksTestiPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <ReflexTestContent />
      </main>
      <SiteFooter />
    </>
  );
}
