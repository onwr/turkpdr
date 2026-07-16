import Image from "next/image";
import Link from "next/link";
import { Calendar, Heart, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPublishedContentHref } from "@/lib/account/content-url";
import type { ProfilePost } from "@/types/profile";

type ProfilePostsProps = {
  posts: ProfilePost[];
  isOwnProfile?: boolean;
};

export function ProfilePosts({ posts, isOwnProfile = false }: ProfilePostsProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Henüz paylaşım bulunmuyor.
        </p>
        {isOwnProfile && (
          <Button className="mt-4 rounded-xl bg-brand-blue" asChild>
            <Link href="/paylasim/yeni">
              <Share2 className="size-4" />
              İlk Paylaşımını Yap
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const href =
          getPublishedContentHref(post.contentType, post.slug) ??
          `/makaleler/${post.slug}`;

        return (
        <article
          key={post.id}
          className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 transition-all hover:border-brand-blue/20 hover:shadow-md sm:p-5"
        >
          <Link
            href={href}
            className="relative block size-20 shrink-0 overflow-hidden rounded-xl sm:size-28"
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="112px"
            />
          </Link>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
                {post.category}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
                {post.type}
              </span>
            </div>

            <h3 className="font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
              <Link href={href}>
                {post.title}
              </Link>
            </h3>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="size-3.5" />
                {post.likeCount} beğeni
              </span>
            </div>
          </div>
        </article>
        );
      })}
    </div>
  );
}
