import type { Metadata } from "next";

import { TestCenterPage } from "@/components/tests/test-center-page";
import { getTestCenterPageData } from "@/lib/queries/tests";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Test Merkezi — Psikolojik Testler | TürkPDR",
  description:
    "Depresyon, kaygı, özgüven, mesleki yönelim ve daha fazlası. Bilimsel geçerliliği kanıtlanmış psikolojik testlere ücretsiz erişin.",
  keywords: [
    "psikolojik test",
    "depresyon testi",
    "kaygı testi",
    "özgüven testi",
    "mesleki yönelim",
    "beck depresyon",
    "PDR testleri",
  ],
  openGraph: {
    title: "TürkPDR Test Merkezi — Psikolojik Testler",
    description:
      "Bilimsel geçerliliği kanıtlanmış psikolojik testlere ücretsiz erişin.",
    type: "website",
    locale: "tr_TR",
  },
};

export default async function Page() {
  const data = await getTestCenterPageData();

  return <TestCenterPage data={data} />;
}
