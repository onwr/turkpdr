import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import type { RelatedArticle } from "@/types/article";

type RelatedArticlesProps = {
  articles: RelatedArticle[];
  basePath?: string;
  listPath?: string;
  title?: string;
};

export function RelatedArticles({
  articles,
  basePath = "/makaleler",
  listPath = "/makaleler",
  title = "İlgili Makaleler",
}: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section
      aria-labelledby="related-articles-heading"
      className="space-y-6"
    >
      <div className="flex items-end justify-between">
        <h2
          id="related-articles-heading"
          className="text-2xl font-bold tracking-tight text-brand-navy"
        >
          {title}
        </h2>
        <Link
          href={listPath}
          className="group hidden items-center gap-1 text-sm font-medium text-brand-blue sm:inline-flex"
        >
          Tümünü Gör
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:shadow-md"
          >
            <Link
              href={`${basePath}/${article.slug}`}
              className="relative block aspect-[16/10] overflow-hidden"
            >
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </Link>

            <div className="space-y-2 p-5">
              <span className="text-xs font-medium text-brand-blue">
                {article.category}
              </span>
              <h3 className="font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
                <Link href={`${basePath}/${article.slug}`}>
                  {article.title}
                </Link>
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {article.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {article.readTime} dk
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
