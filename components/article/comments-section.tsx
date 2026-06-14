"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ArticleComment } from "@/types/article";

type CommentsSectionProps = {
  contentId: string;
  initialComments: ArticleComment[];
  isLoggedIn: boolean;
};

export function CommentsSection({
  contentId,
  initialComments,
  isLoggedIn,
}: CommentsSectionProps) {
  const pathname = usePathname();
  const loginUrl = `/giris?callbackUrl=${encodeURIComponent(pathname)}`;

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) return;
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/contents/${contentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Yorum gönderilemedi.");
      }

      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
      setSuccess(data.message || "Yorumunuz eklendi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="comments-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="size-5 text-brand-blue" />
        <h2
          id="comments-heading"
          className="text-xl font-bold text-brand-navy"
        >
          Yorumlar
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {comments.length}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {isLoggedIn ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="mb-8 space-y-3">
          <label htmlFor="comment-input" className="sr-only">
            Yorum yazın
          </label>
          <textarea
            id="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Düşüncelerinizi paylaşın..."
            rows={4}
            maxLength={2000}
            disabled={submitting}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/2000
            </span>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl bg-brand-blue hover:bg-brand-blue/90"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitting ? "Gönderiliyor..." : "Yorum Gönder"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Yorum yapmak için{" "}
            <Link
              href={loginUrl}
              className="font-medium text-brand-blue hover:underline"
            >
              giriş yapın
            </Link>
            .
          </p>
        </div>
      )}

      {comments.length > 0 ? (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex gap-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={comment.avatar}
                  alt={comment.author}
                  fill
                  className="object-cover"
                  sizes="40px"
                  unoptimized={comment.avatar.startsWith("/uploads/")}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-brand-navy">
                    {comment.author}
                  </span>
                  <time className="text-xs text-muted-foreground">
                    {comment.date}
                  </time>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Henüz yorum yapılmamış. İlk yorumu siz yapın!
        </p>
      )}
    </section>
  );
}
