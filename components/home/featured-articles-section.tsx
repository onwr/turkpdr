import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import type { Article } from "@/types/home";
import { siteContainerClass, siteSectionClass } from "@/lib/site-layout";

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm shadow-brand-navy/5 transition-all hover:-translate-y-1 hover:border-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/10 dark:bg-card dark:shadow-none">
      <Link href={`/makaleler/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={article.coverImage.startsWith("/uploads/")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <span className="w-fit rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
          {article.category}
        </span>

        <h3 className="text-lg font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue dark:text-foreground">
          <Link href={`/makaleler/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="size-3.5" />
            {article.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {article.date}
          </span>
        </div>
      </div>
    </article>
  );
}

type FeaturedArticlesSectionProps = {
  articles: Article[];
};

export function FeaturedArticlesSection({ articles }: FeaturedArticlesSectionProps) {
  return (
    <section
      aria-labelledby="featured-articles-heading"
      className={`bg-white dark:bg-background ${siteSectionClass}`}
    >
      <div className={siteContainerClass}>
        <SectionHeader
          title="Öne Çıkan Makaleler"
          description="Alanında uzman yazarlarımızın en güncel ve okuyucularımızın en çok ilgi gösterdiği makaleleri keşfedin."
          href="/makaleler"
        />

        {articles.length === 0 ? (
          <EmptyState
            title="Henüz öne çıkan makale yok"
            description="Yayınlanmış öne çıkan makale bulunmuyor. Yakında yeni içerikler eklenecek."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
