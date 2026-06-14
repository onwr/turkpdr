import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TestDetailPage } from "@/components/tests/test-detail-page";
import {
  getPublishedTestSlugs,
  getTestPageData,
  getTestSeoBySlug,
} from "@/lib/queries/tests";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedTestSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getTestSeoBySlug(slug);

  if (!seo) {
    return { title: "Test Bulunamadı | TürkPDR" };
  }

  return buildPageMetadata(seo, { type: "website" });
}

export default async function TestDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTestPageData(slug);

  if (!data) {
    notFound();
  }

  return (
    <TestDetailPage test={data.test} relatedTests={data.relatedTests} />
  );
}
