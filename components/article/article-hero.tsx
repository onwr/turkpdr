import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ArticleDetail } from "@/types/article";

type ArticleHeroProps = {
  article: ArticleDetail;
};

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <header className="space-y-6">
      <div className="space-y-4">
        <Badge className="rounded-full bg-brand-blue/10 px-3 py-1 text-brand-blue hover:bg-brand-blue/10">
          {article.category}
        </Badge>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {article.title}
        </h1>

        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <Link
          href={`/profil/${article.author.slug}`}
          className="inline-flex items-center gap-2 font-medium text-brand-navy transition-colors hover:text-brand-blue"
        >
          <User className="size-4" />
          {article.author.name}
        </Link>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="size-4" />
          <time dateTime={article.publishedAt}>{article.date}</time>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" />
          {article.readTime} dk okuma
        </span>
      </div>

      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-lg shadow-brand-navy/10">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
          priority
        />
      </div>
    </header>
  );
}
