import Image from "next/image";
import Link from "next/link";
import { PenLine } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import type { Author } from "@/types/home";
import { siteContainerClass, siteSectionClass } from "@/lib/site-layout";

function AuthorCard({ author }: { author: Author }) {
  return (
    <article className="group flex flex-col items-center rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm shadow-brand-navy/5 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md hover:shadow-brand-blue/10 dark:bg-card dark:shadow-none">
      <Link
        href={`/profil/${author.id}`}
        className="relative mb-4 block size-24 overflow-hidden rounded-2xl ring-4 ring-brand-blue/10 transition-all group-hover:ring-brand-blue/25"
      >
        <Image
          src={author.avatar}
          alt={author.name}
          fill
          className="object-cover"
          sizes="96px"
          unoptimized={author.avatar.startsWith("/uploads/")}
        />
      </Link>

      <h3 className="text-lg font-semibold text-brand-navy transition-colors group-hover:text-brand-blue dark:text-foreground">
        <Link href={`/profil/${author.id}`}>{author.name}</Link>
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">{author.title}</p>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1.5 text-sm font-medium text-brand-blue">
        <PenLine className="size-3.5" />
        {author.articleCount} yazı
      </div>
    </article>
  );
}

type AuthorsSectionProps = {
  authors: Author[];
};

export function AuthorsSection({ authors }: AuthorsSectionProps) {
  return (
    <section
      aria-labelledby="authors-heading"
      className={`bg-slate-50/80 dark:bg-muted/30 ${siteSectionClass}`}
    >
      <div className={siteContainerClass}>
        <SectionHeader
          title="Yazarlar"
          description="TürkPDR'ın değerli yazar kadrosu ile tanışın."
          href="/yazarlar"
        />

        {authors.length === 0 ? (
          <EmptyState
            title="Henüz yazar yok"
            description="Yayınlanmış içeriği olan yazar bulunmuyor."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {authors.map((author) => (
              <AuthorCard key={author.id} author={author} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
