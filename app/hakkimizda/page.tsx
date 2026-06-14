import type { Metadata } from "next";

import { StaticContentPage } from "@/components/shared/static-content-page";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "TürkPDR hakkında bilgi edinin. Türkiye'nin kapsamlı psikolojik danışmanlık ve rehberlik platformu.",
};

export default function HakkimizdaPage() {
  return (
    <StaticContentPage
      title="Hakkımızda"
      description="Türkiye'nin psikolojik danışmanlık ve rehberlik alanındaki dijital buluşma noktası."
      badge="TürkPDR"
    >
      <p>
        TürkPDR, psikolojik danışmanlık ve rehberlik (PDR) alanında çalışan
        uzmanlar, öğrenciler ve ilgilenen herkes için kapsamlı bir bilgi ve
        kaynak platformudur.
      </p>
      <p>
        Makaleler, haberler, test merkezi, dosya merkezi, sözlük ve psiko sanat
        bölümleriyle alanın ihtiyaç duyduğu güncel içerikleri tek çatı altında
        sunmayı hedefliyoruz.
      </p>
      <h2>Misyonumuz</h2>
      <p>
        PDR alanındaki bilgi ve kaynaklara erişimi kolaylaştırmak, mesleki
        gelişimi desteklemek ve toplumda psikolojik farkındalığı artırmaktır.
      </p>
      <h2>Vizyonumuz</h2>
      <p>
        Türkiye&apos;nin en güvenilir ve kapsamlı PDR dijital platformu olmak;
        uzmanlar ve öğrenciler için vazgeçilmez bir referans kaynağı
        haline gelmektir.
      </p>
    </StaticContentPage>
  );
}
