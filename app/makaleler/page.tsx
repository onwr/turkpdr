import type { Metadata } from "next";

import { ContentListPage } from "@/components/content/content-list-page";
import { getPublishedArticles } from "@/lib/queries/articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Makaleler | TürkPDR",
  description:
    "Psikolojik rehberlik ve danışmanlık alanında uzman yazarların makalelerini keşfedin.",
  openGraph: {
    title: "Makaleler | TürkPDR",
    description:
      "Psikolojik rehberlik ve danışmanlık alanında uzman yazarların makalelerini keşfedin.",
    type: "website",
    locale: "tr_TR",
  },
};

export default async function MakalelerPage() {
  const articles = await getPublishedArticles();

  return (
    <ContentListPage
      title="Makaleler"
      description="Alanında uzman yazarlarımızın güncel makale ve rehberlik yazıları."
      items={articles}
      basePath="/makaleler"
      emptyTitle="Henüz makale yok"
      emptyDescription="Yayınlanmış makale bulunmuyor. Yakında yeni içerikler eklenecek."
    />
  );
}
