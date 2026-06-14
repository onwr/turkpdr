import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import type { Article } from "@/types/home";

type ContentListPageProps = {
  title: string;
  description: string;
  items: Article[];
  basePath: string;
  emptyTitle: string;
  emptyDescription: string;
  topContent?: React.ReactNode;
};

function ArticleCard({
  article,
  basePath,
}: {
  article: Article;
  basePath: string;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm shadow-brand-navy/5 transition-all hover:-translate-y-1 hover:border-brand-blue/20 hover:shadow-lg hover:shadow-brand-blue/10">
      <Link
        href={`${basePath}/${article.slug}`}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={article.coverImage.startsWith("/uploads/")}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <span className="w-fit rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
          {article.category}
        </span>

        <h2 className="text-lg font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
          <Link href={`${basePath}/${article.slug}`}>{article.title}</Link>
        </h2>

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

export function ContentListPage({
  title,
  description,
  items,
  basePath,
  emptyTitle,
  emptyDescription,
  topContent,
}: ContentListPageProps) {
  return (
    <>
      <SiteHeader />
      {topContent}
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  basePath={basePath}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
