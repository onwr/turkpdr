import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ContentListPage } from "@/components/content/content-list-page";
import {
  getArticleCategories,
  getArticleCategoryBySlug,
  getPublishedArticlesByCategory,
} from "@/lib/queries/articles";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const categories = await getArticleCategories();
    return categories.map((category) => ({ slug: category.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getArticleCategoryBySlug(slug);

  if (!category) {
    return { title: "Kategori Bulunamadı | TürkPDR" };
  }

  return {
    title: `${category.name} Makaleleri | TürkPDR`,
    description: `${category.name} kategorisindeki psikolojik danışmanlık ve rehberlik makaleleri.`,
    openGraph: {
      title: `${category.name} Makaleleri | TürkPDR`,
      description: `${category.name} kategorisindeki makaleleri keşfedin.`,
      type: "website",
      locale: "tr_TR",
    },
  };
}

export default async function ArticleCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getArticleCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const articles = await getPublishedArticlesByCategory(slug);

  const breadcrumb = (
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
              <Link href="/makaleler" className="hover:text-brand-blue">
                Makaleler
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
  );

  return (
    <ContentListPage
      title={category.name}
      description={`${category.name} kategorisindeki güncel makale ve rehberlik yazıları.`}
      items={articles}
      basePath="/makaleler"
      emptyTitle="Bu kategoride makale yok"
      emptyDescription="Seçilen kategoride yayınlanmış makale bulunmuyor."
      topContent={breadcrumb}
    />
  );
}
