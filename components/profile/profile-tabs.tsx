"use client";

import { useState } from "react";
import { Bookmark, Download, FileText } from "lucide-react";

import { ProfileFavorites } from "@/components/profile/profile-favorites";
import { ProfileFiles } from "@/components/profile/profile-files";
import { ProfilePosts } from "@/components/profile/profile-posts";
import type {
  ProfileFavorite,
  ProfileFile,
  ProfilePost,
  ProfileTab,
} from "@/types/profile";
import { cn } from "@/lib/utils";

const tabs: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: "posts", label: "Paylaşımlar", icon: FileText },
  { id: "files", label: "Dosyalar", icon: Download },
  { id: "favorites", label: "Favoriler", icon: Bookmark },
];

type ProfileTabsProps = {
  posts: ProfilePost[];
  files: ProfileFile[];
  favorites: ProfileFavorite[];
  isOwnProfile?: boolean;
};

export function ProfileTabs({
  posts,
  files,
  favorites,
  isOwnProfile = false,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const counts: Record<ProfileTab, number> = {
    posts: posts.length,
    files: files.length,
    favorites: favorites.length,
  };

  return (
    <section aria-label="Profil içerik sekmeleri">
      <div
        className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  isActive ? "bg-white/20" : "bg-slate-100"
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={activeTab}
      >
        {activeTab === "posts" && (
          <ProfilePosts posts={posts} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === "files" && <ProfileFiles files={files} />}
        {activeTab === "favorites" && <ProfileFavorites favorites={favorites} />}
      </div>
    </section>
  );
}
