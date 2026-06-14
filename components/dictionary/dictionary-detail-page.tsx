"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Eye,
  Link2,
  Share2,
} from "lucide-react";

import type {
  PublicDictionaryDetail,
  PublicDictionaryTerm,
} from "@/types/dictionary";
import { cn } from "@/lib/utils";

type DictionaryDetailPageProps = {
  term: PublicDictionaryDetail;
  similarTerms: PublicDictionaryTerm[];
  shareUrl: string;
};

function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [url]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Paylaş:</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm",
          "text-brand-navy transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
        )}
        aria-label="X'te paylaş"
      >
        <Share2 className="size-4" />
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm",
          "text-brand-navy transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        )}
        aria-label="Facebook'ta paylaş"
      >
        <Share2 className="size-4" />
        Facebook
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm",
          "text-brand-navy transition-colors hover:border-brand-blue/30 hover:bg-brand-blue/5 hover:text-brand-blue"
        )}
      >
        {copied ? (
          <>
            <Check className="size-4 text-emerald-600" />
            Kopyalandı
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Linki Kopyala
          </>
        )}
      </button>
    </div>
  );
}

function SimilarTermCard({ term }: { term: PublicDictionaryTerm }) {
  return (
    <Link
      href={`/sozluk/${term.slug}`}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-blue/20 hover:shadow-md"
    >
      <p className="font-medium text-brand-navy group-hover:text-brand-blue">
        {term.title}
      </p>
      {term.shortDescription && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {term.shortDescription}
        </p>
      )}
    </Link>
  );
}

export function DictionaryDetailPage({
  term,
  similarTerms,
  shareUrl,
}: DictionaryDetailPageProps) {
  const formattedDate = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(term.updatedAt));

  return (
    <main className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/sozluk"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
          >
            <ArrowLeft className="size-4" />
            Sözlüğe Dön
          </Link>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                  <BookOpen className="size-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
                    {term.title}
                  </h1>
                  {term.shortDescription && (
                    <p className="mt-2 text-lg text-muted-foreground">
                      {term.shortDescription}
                    </p>
                  )}
                </div>
              </div>
              {term.category && (
                <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-medium text-brand-blue">
                  {term.category}
                </span>
              )}
            </div>

            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4 text-brand-blue" />
                {new Intl.NumberFormat("tr-TR").format(term.views)} görüntülenme
              </span>
              <span>Son güncelleme: {formattedDate}</span>
            </div>

            {term.content ? (
              <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-600">
                {term.content}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Bu terim için detaylı içerik henüz eklenmemiş.
              </p>
            )}

            <div className="mt-10 border-t border-slate-100 pt-6">
              <ShareButtons url={shareUrl} title={term.title} />
            </div>
          </article>

          {similarTerms.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-navy">
                <Link2 className="size-5 text-brand-blue" />
                Benzer Terimler
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {similarTerms.map((similar) => (
                  <SimilarTermCard key={similar.id} term={similar} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
  );
}
