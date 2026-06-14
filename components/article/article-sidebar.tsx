import Link from "next/link";
import { ArrowRight, ClipboardList, Flame, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ArticleCategory, PopularArticle } from "@/types/article";

function formatReadCount(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

type ArticleSidebarProps = {
  popularArticles: PopularArticle[];
  articleCategories: ArticleCategory[];
  basePath?: string;
};

export function ArticleSidebar({
  popularArticles,
  articleCategories,
  basePath = "/makaleler",
}: ArticleSidebarProps) {
  return (
    <aside className="space-y-6" aria-label="Makale kenar çubuğu">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <Flame className="size-4 text-brand-blue" />
          Popüler Yazılar
        </h2>
        {popularArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Henüz popüler yazı bulunmuyor.
          </p>
        ) : (
          <ol className="space-y-3">
            {popularArticles.map((article, index) => (
              <li key={`${article.id}-${index}`}>
                <Link
                  href={`${basePath}/${article.slug}`}
                  className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-xs font-bold text-brand-blue">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-brand-navy transition-colors group-hover:text-brand-blue">
                      {article.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatReadCount(article.readCount)} okuma
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <FolderOpen className="size-4 text-brand-blue" />
          Kategoriler
        </h2>
        {articleCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Henüz kategori bulunmuyor.
          </p>
        ) : (
          <ul className="space-y-1">
            {articleCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`${basePath}/kategori/${category.slug}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                >
                  <span className="text-slate-600 hover:text-brand-blue">
                    {category.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-muted-foreground">
                    {category.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue via-blue-600 to-sky-500 p-5 shadow-lg shadow-brand-blue/20">
        <div className="space-y-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
            <ClipboardList className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Test Merkezi</h2>
            <p className="mt-1 text-sm text-white/85">
              Psikolojik testlere ücretsiz erişin ve sonuçlarınızı anında görün.
            </p>
          </div>
          <Button
            size="sm"
            className="w-full rounded-xl bg-white text-brand-blue hover:bg-white/90"
            asChild
          >
            <Link href="/test-merkezi">
              Testlere Git
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </aside>
  );
}
