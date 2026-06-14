import Image from "next/image";
import Link from "next/link";
import { PenLine } from "lucide-react";

import type { ArticleAuthor } from "@/types/article";

type ArticleAuthorBoxProps = {
  author: ArticleAuthor;
};

export function ArticleAuthorBox({ author }: ArticleAuthorBoxProps) {
  return (
    <aside
      aria-label="Yazar bilgisi"
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:flex-row sm:items-center"
    >
      <Link
        href={`/profil/${author.slug}`}
        className="relative block size-20 shrink-0 overflow-hidden rounded-2xl ring-4 ring-brand-blue/10 transition-all hover:ring-brand-blue/25"
      >
        <Image
          src={author.avatar}
          alt={author.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h2 className="text-lg font-semibold text-brand-navy">
            <Link
              href={`/profil/${author.slug}`}
              className="transition-colors hover:text-brand-blue"
            >
              {author.name}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground">{author.title}</p>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{author.bio}</p>
        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue">
          <PenLine className="size-3.5" />
          {author.articleCount} makale
        </p>
      </div>
    </aside>
  );
}
