import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { NewsListPage } from "@/components/content/news-list-page";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import {
  getNewsCategories,
  getNewsCategoryBySlug,
  getPublishedNewsByCategory,
} from "@/lib/queries/articles";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const categories = await getNewsCategories();
    return categories.map((category) => ({ slug: category.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getNewsCategoryBySlug(slug);

  if (!category) {
    return { title: "Kategori Bulunamadı | TürkPDR" };
  }

  return {
    title: `${category.name} Haberleri | TürkPDR`,
    description: `${category.name} kategorisindeki haberler ve duyurular.`,
  };
}

export default async function NewsCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getNewsCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const news = await getPublishedNewsByCategory(slug);

  return (
    <>
      <SiteHeader />
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-brand-blue">
                  Ana Sayfa
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link href="/haberler" className="hover:text-brand-blue">
                  Haberler
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-brand-navy">{category.name}</li>
            </ol>
          </nav>
        </div>
      </div>
      <NewsListPage
        title={category.name}
        description={`${category.name} kategorisindeki güncel haberler ve duyurular.`}
        items={news}
        emptyTitle="Bu kategoride haber yok"
        emptyDescription="Seçilen kategoride yayınlanmış haber bulunmuyor."
      />
      <SiteFooter />
    </>
  );
}
