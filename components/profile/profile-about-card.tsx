import { Briefcase, User } from "lucide-react";

import type { UserProfile } from "@/types/profile";

type ProfileAboutCardProps = {
  profile: UserProfile;
};

export function ProfileAboutCard({ profile }: ProfileAboutCardProps) {
  return (
    <section
      aria-labelledby="about-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6"
    >
      <h2
        id="about-heading"
        className="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-navy"
      >
        <User className="size-5 text-brand-blue" />
        Hakkımda
      </h2>

      <p className="leading-relaxed text-slate-600">
        {profile.about || "Henüz biyografi eklenmemiş."}
      </p>

      <div className="mt-6 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <Briefcase className="size-4 text-brand-blue" />
          Çalışma Alanları
        </h3>
        {profile.workAreas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.workAreas.map((area) => (
              <span
                key={area}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600"
              >
                {area}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Henüz çalışma alanı eklenmemiş.
          </p>
        )}
      </div>
    </section>
  );
}
