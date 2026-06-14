import type { ArticleDetail } from "@/types/article";

type ArticleContentProps = {
  article: ArticleDetail;
};

export function ArticleContent({ article }: ArticleContentProps) {
  return (
    <article
      className="article-prose rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8 lg:p-10"
      aria-label="Makale içeriği"
    >
      <div
        className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-brand-navy prose-h2:mt-10 prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-blockquote:border-brand-blue prose-blockquote:bg-brand-blue/5 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-brand-navy prose-li:text-slate-600 prose-strong:text-brand-navy"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.tags.length > 0 && (
        <footer className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
}
