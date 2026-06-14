import Image from "next/image";
import Link from "next/link";
import { PenLine, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types/profile";
import { MessageUserButton } from "@/components/profile/message-user-button";

type ProfileHeroProps = {
  profile: UserProfile;
  currentUserId?: string | null;
};

export function ProfileHero({ profile, currentUserId }: ProfileHeroProps) {
  const isOwnProfile = currentUserId === profile.id;
  const hasCoverImage = Boolean(profile.coverImage);

  return (
    <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <div className="relative h-36 sm:h-44">
        {hasCoverImage ? (
          <>
            <Image
              src={profile.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-blue/25 via-sky-200 to-blue-100"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="relative bg-white px-5 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:size-28">
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="112px"
              priority
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pb-1">
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
                {profile.name}
              </h1>
              <p className="text-base text-muted-foreground">{profile.title}</p>
              <div className="flex flex-wrap gap-2">
                {profile.workAreas.slice(0, 3).map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="rounded-full bg-brand-blue/10 text-brand-blue"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isOwnProfile ? (
                <>
                  <Button className="rounded-xl bg-brand-blue" asChild>
                    <Link href="/paylasim/yeni">
                      <Share2 className="size-4" />
                      Paylaşım Yap
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-xl" asChild>
                    <Link href={`/profil/${profile.id}/duzenle`}>
                      <PenLine className="size-4" />
                      Profili Düzenle
                    </Link>
                  </Button>
                </>
              ) : (
                <MessageUserButton
                  profileId={profile.id}
                  currentUserId={currentUserId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
