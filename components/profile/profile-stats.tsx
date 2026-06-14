import { Calendar, Download, FileText, Heart } from "lucide-react";

import type { UserProfile } from "@/types/profile";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

type ProfileStatsProps = {
  profile: UserProfile;
};

export function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = [
    {
      label: "Toplam Paylaşım",
      value: profile.totalPosts,
      icon: FileText,
      color: "bg-blue-50 text-brand-blue",
    },
    {
      label: "Toplam Dosya",
      value: profile.totalFiles,
      icon: Download,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Toplam Beğeni",
      value: profile.totalLikes,
      icon: Heart,
      color: "bg-red-50 text-red-500",
    },
    {
      label: "Katılım Tarihi",
      value: profile.joinedDate,
      icon: Calendar,
      color: "bg-emerald-50 text-emerald-600",
      isText: true,
    },
  ];

  return (
    <section
      aria-label="Profil istatistikleri"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5"
          >
            <div
              className={`mb-3 flex size-9 items-center justify-center rounded-xl ${stat.color}`}
            >
              <Icon className="size-4" />
            </div>
            <p className="text-xl font-bold text-brand-navy sm:text-2xl">
              {stat.isText ? stat.value : formatNumber(stat.value as number)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {stat.label}
            </p>
          </article>
        );
      })}
    </section>
  );
}
