"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bookmark, Heart, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ArticleActionsProps = {
  contentId: string;
  title: string;
  initialLikeCount: number;
  initialLiked: boolean;
  initialFavorited: boolean;
  isLoggedIn: boolean;
};

export function ArticleActions({
  contentId,
  title,
  initialLikeCount,
  initialLiked,
  initialFavorited,
  isLoggedIn,
}: ArticleActionsProps) {
  const pathname = usePathname();
  const loginUrl = `/giris?callbackUrl=${encodeURIComponent(pathname)}`;

  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [likes, setLikes] = useState(initialLikeCount);
  const [loading, setLoading] = useState<"like" | "favorite" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }

    setLoading("like");
    setError(null);

    try {
      const res = await fetch(`/api/contents/${contentId}/like`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Beğeni işlemi başarısız.");
      }

      setLiked(data.liked);
      setLikes(data.likeCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(null);
    }
  };

  const handleFavorite = async () => {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }

    setLoading("favorite");
    setError(null);

    try {
      const res = await fetch(`/api/contents/${contentId}/favorite`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Favori işlemi başarısız.");
      }

      setFavorited(data.favorited);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        await navigator.clipboard.writeText(url);
        window.alert("Bağlantı panoya kopyalandı.");
      }
    } else {
      await navigator.clipboard.writeText(url);
      window.alert("Bağlantı panoya kopyalandı.");
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50"
        role="group"
        aria-label="Makale işlemleri"
      >
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-xl",
            liked && "border-red-200 bg-red-50 text-red-600"
          )}
          onClick={() => void handleLike()}
          disabled={loading === "like"}
          aria-pressed={liked}
        >
          <Heart className={cn("size-4", liked && "fill-current")} />
          Beğen ({likes})
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => void handleShare()}
        >
          <Share2 className="size-4" />
          Paylaş
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-xl",
            favorited &&
              "border-brand-blue/30 bg-brand-blue/5 text-brand-blue"
          )}
          onClick={() => void handleFavorite()}
          disabled={loading === "favorite"}
          aria-pressed={favorited}
        >
          <Bookmark className={cn("size-4", favorited && "fill-current")} />
          {favorited ? "Favorilerde" : "Favorilere Ekle"}
        </Button>

        {!isLoggedIn && (
          <p className="w-full text-xs text-muted-foreground">
            Beğenmek veya favorilere eklemek için{" "}
            <Link href={loginUrl} className="font-medium text-brand-blue hover:underline">
              giriş yapın
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
