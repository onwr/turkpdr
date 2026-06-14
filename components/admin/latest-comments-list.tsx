import Link from "next/link";
import { ExternalLink, MessageSquare } from "lucide-react";

import { formatContentDate } from "@/lib/admin/content-display";
import type { DashboardComment } from "@/types/admin";

type LatestCommentsListProps = {
  comments: DashboardComment[];
};

export function LatestCommentsList({ comments }: LatestCommentsListProps) {
  return (
    <section
      aria-labelledby="latest-comments-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2
            id="latest-comments-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            Son Yorumlar
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            İçeriklere yapılan son yorumlar
          </p>
        </div>
        <Link
          href="/admin/comments"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Tümü
        </Link>
      </div>

      {comments.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Henüz yorum bulunmuyor.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {comments.map((comment) => (
            <li key={comment.id} className="px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <MessageSquare className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-brand-navy">
                    {comment.content}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comment.userName} · {comment.postTitle}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <time className="text-xs text-muted-foreground">
                      {formatContentDate(comment.createdAt)}
                    </time>
                    {comment.postViewUrl && (
                      <Link
                        href={comment.postViewUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                      >
                        Görüntüle
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
