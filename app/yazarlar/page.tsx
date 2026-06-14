import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PublicPageShell } from "@/components/shared/public-page-shell";
import { getPublishedAuthors } from "@/lib/queries/authors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yazarlar",
  description:
    "TürkPDR yazarları ve uzmanları. Psikolojik danışmanlık alanında içerik üreten yazarlarımızı keşfedin.",
};

export default async function YazarlarPage() {
  const authors = await getPublishedAuthors();

  return (
    <PublicPageShell>
      <main className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Yazarlar"
            description="Alanında uzman yazarlarımız ve içerik üreticilerimiz."
            badge="Topluluk"
          />

          {authors.length === 0 ? (
            <EmptyState
              title="Henüz yazar yok"
              description="Yayınlanmış içeriği bulunan yazar henüz listelenmiyor."
              icon="users"
              action={{ label: "Makalelere Göz At", href: "/makaleler" }}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {authors.map((author) => (
                <Link
                  key={author.id}
                  href={`/profil/${author.slug}`}
                  className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md"
                >
                  <div className="relative mb-4 size-20 overflow-hidden rounded-full ring-2 ring-brand-blue/20">
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      fill
                      className="object-cover"
                      unoptimized={author.avatar.startsWith("/uploads/")}
                    />
                  </div>
                  <h2 className="font-semibold text-brand-navy group-hover:text-brand-blue">
                    {author.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {author.title}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-blue">
                    <FileText className="size-3.5" />
                    {author.articleCount} içerik
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}
