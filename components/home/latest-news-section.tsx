import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import type { NewsItem } from "@/types/home";
import { siteContainerClass, siteSectionClass } from "@/lib/site-layout";

function FeaturedNewsCard({ news }: { news: NewsItem }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl shadow-lg shadow-brand-navy/10 dark:shadow-none">
      <Link
        href={`/haberler/${news.slug}`}
        className="relative block aspect-[16/9] sm:aspect-[21/9]"
      >
        <Image
          src={news.coverImage}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
          unoptimized={news.coverImage.startsWith("/uploads/")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/40 to-transparent" />
      </Link>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
        <span className="mb-3 inline-block rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-white">
          {news.category}
        </span>
        <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
          <Link
            href={`/haberler/${news.slug}`}
            className="transition-colors hover:text-sky-200"
          >
            {news.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 max-w-3xl text-sm text-white/80 sm:text-base">
          {news.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-sm text-white/70">
          <Calendar className="size-4" />
          {news.date}
        </div>
      </div>
    </article>
  );
}

function NewsGridCard({ news }: { news: NewsItem }) {
  return (
    <article className="group flex gap-4 overflow-hidden rounded-2xl border border-border/60 bg-white p-3 shadow-sm transition-all hover:border-brand-blue/20 hover:shadow-md dark:bg-card sm:flex-col sm:p-0">
      <Link
        href={`/haberler/${news.slug}`}
        className="relative block size-24 shrink-0 overflow-hidden rounded-xl sm:aspect-[16/10] sm:size-auto sm:rounded-b-none sm:rounded-t-2xl"
      >
        <Image
          src={news.coverImage}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 96px, 300px"
          unoptimized={news.coverImage.startsWith("/uploads/")}
        />
      </Link>

      <div className="flex flex-1 flex-col justify-center py-1 sm:p-4">
        <span className="mb-1.5 text-xs font-medium text-brand-blue">
          {news.category}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue dark:text-foreground sm:text-base">
          <Link href={`/haberler/${news.slug}`}>{news.title}</Link>
        </h3>
        <p className="mt-1.5 hidden line-clamp-2 text-sm text-muted-foreground sm:block">
          {news.excerpt}
        </p>
        <time className="mt-2 text-xs text-muted-foreground">{news.date}</time>
      </div>
    </article>
  );
}

type LatestNewsSectionProps = {
  news: NewsItem[];
};

export function LatestNewsSection({ news }: LatestNewsSectionProps) {
  const featured = news.find((item) => item.featured) ?? news[0];
  const gridNews = featured ? news.filter((item) => item.id !== featured.id) : [];

  return (
    <section
      aria-labelledby="latest-news-heading"
      className={`bg-white dark:bg-background ${siteSectionClass}`}
    >
      <div className={siteContainerClass}>
        <SectionHeader
          title="Son Haberler"
          description="PDR dünyasından en güncel haberler ve duyurular."
          href="/haberler"
        />

        {news.length === 0 ? (
          <EmptyState
            title="Henüz haber yok"
            description="Yayınlanmış haber bulunmuyor. Yakında yeni haberler eklenecek."
          />
        ) : (
          <div className="space-y-8">
            {featured && <FeaturedNewsCard news={featured} />}

            {gridNews.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {gridNews.map((item) => (
                  <NewsGridCard key={item.id} news={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
