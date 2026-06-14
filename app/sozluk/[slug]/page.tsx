import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DictionaryDetailPage } from "@/components/dictionary/dictionary-detail-page";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import {
  getDictionaryTermBySlug,
  getDictionarySeoBySlug,
  getPublishedDictionarySlugs,
  getSimilarDictionaryTerms,
  incrementDictionaryViews,
} from "@/lib/queries/dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedDictionarySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getDictionarySeoBySlug(slug);

  if (!seo) {
    return { title: "Terim Bulunamadı" };
  }

  const term = await getDictionaryTermBySlug(slug);

  return buildPageMetadata(seo, {
    keywords: [
      term?.title,
      term?.category ?? "psikoloji",
      "PDR sözlüğü",
      "psikoloji terimleri",
    ].filter(Boolean) as string[],
    type: "article",
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const term = await getDictionaryTermBySlug(slug);

  if (!term) {
    notFound();
  }

  await incrementDictionaryViews(term.id);

  const similarTerms = await getSimilarDictionaryTerms(
    term.id,
    term.category,
    4
  );

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://turkpdr.com";
  const shareUrl = `${baseUrl}/sozluk/${term.slug}`;

  return (
    <>
      <SiteHeader />
      <DictionaryDetailPage
        term={{ ...term, views: term.views + 1 }}
        similarTerms={similarTerms}
        shareUrl={shareUrl}
      />
      <SiteFooter />
    </>
  );
}
