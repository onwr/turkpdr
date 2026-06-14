import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import type { NewsItem } from "@/types/home";

type NewsListPageProps = {
  title: string;
  description: string;
  items: NewsItem[];
  emptyTitle: string;
  emptyDescription: string;
};

function NewsCard({ news }: { news: NewsItem }) {
  return (
    <article className="group flex gap-4 overflow-hidden rounded-2xl border border-border/60 bg-white p-3 shadow-sm transition-all hover:border-brand-blue/20 hover:shadow-md sm:flex-col sm:p-0">
      <Link
        href={`/haberler/${news.slug}`}
        className="relative block size-24 shrink-0 overflow-hidden rounded-xl sm:aspect-16/10 sm:size-auto sm:rounded-b-none sm:rounded-t-2xl"
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
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue sm:text-base">
          <Link href={`/haberler/${news.slug}`}>{news.title}</Link>
        </h2>
        <p className="mt-1.5 hidden line-clamp-2 text-sm text-muted-foreground sm:block">
          {news.excerpt}
        </p>
        <time className="mt-2 text-xs text-muted-foreground">{news.date}</time>
      </div>
    </article>
  );
}

export function NewsListPage({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
}: NewsListPageProps) {
  const featured = items.find((item) => item.featured) ?? items[0];
  const gridNews = featured ? items.filter((item) => item.id !== featured.id) : [];

  return (
    <main className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
          </div>

          {items.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            <div className="space-y-6">
              {featured && (
                <article className="group relative overflow-hidden rounded-3xl shadow-lg shadow-brand-navy/10">
                  <Link
                    href={`/haberler/${featured.slug}`}
                    className="relative block aspect-video sm:aspect-21/9"
                  >
                    <Image
                      src={featured.coverImage}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      priority
                      unoptimized={featured.coverImage.startsWith("/uploads/")}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-brand-navy/90 via-brand-navy/40 to-transparent" />
                  </Link>
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                    <span className="mb-3 inline-block rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-white">
                      {featured.category}
                    </span>
                    <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                      <Link
                        href={`/haberler/${featured.slug}`}
                        className="transition-colors hover:text-sky-200"
                      >
                        {featured.title}
                      </Link>
                    </h2>
                    <p className="mt-3 line-clamp-2 max-w-3xl text-sm text-white/80 sm:text-base">
                      {featured.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-sm text-white/70">
                      <Calendar className="size-4" />
                      {featured.date}
                    </div>
                  </div>
                </article>
              )}

              {gridNews.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {gridNews.map((news) => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
  );
}
