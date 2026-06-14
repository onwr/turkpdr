import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProfileAboutCard } from "@/components/profile/profile-about-card";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import type {
  PopularContent,
  ProfileFavorite,
  ProfileFile,
  ProfilePost,
  UserProfile,
} from "@/types/profile";

type ProfilePageProps = {
  profile: UserProfile;
  posts: ProfilePost[];
  files: ProfileFile[];
  favorites: ProfileFavorite[];
  popular: PopularContent[];
  currentUserId?: string | null;
};

export function ProfilePage({
  profile,
  posts,
  files,
  favorites,
  popular,
  currentUserId,
}: ProfilePageProps) {
  return (
    <>
      <SiteHeader />
      <main className="bg-gradient-to-b from-sky-50/60 via-white to-white">
        <div className="border-b border-slate-100 bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-brand-blue">
                    Ana Sayfa
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li>
                  <Link href="/yazarlar" className="hover:text-brand-blue">
                    Yazarlar
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="font-medium text-brand-navy">{profile.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-10 xl:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-6">
              <ProfileHero profile={profile} currentUserId={currentUserId} />
              <ProfileStats profile={profile} />
              <ProfileAboutCard profile={profile} />
              <ProfileTabs
                posts={posts}
                files={files}
                favorites={favorites}
                isOwnProfile={currentUserId === profile.id}
              />
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProfileSidebar
                profile={profile}
                popularContent={popular}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
