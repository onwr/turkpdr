import Link from "next/link";
import {
  ArrowRight,
  Award,
  Globe,
  Mail,
  MapPin,
  PenLine,
  Phone,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PopularContent, UserProfile } from "@/types/profile";

function formatViewCount(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

type ProfileSidebarProps = {
  profile: UserProfile;
  popularContent: PopularContent[];
  currentUserId?: string | null;
};

export function ProfileSidebar({
  profile,
  popularContent,
  currentUserId,
}: ProfileSidebarProps) {
  const isOwnProfile = currentUserId === profile.id;
  const isLoggedIn = Boolean(currentUserId);

  return (
    <aside className="space-y-6" aria-label="Profil kenar çubuğu">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
        <h2 className="mb-4 text-sm font-semibold text-brand-navy">
          İletişim Bilgileri
        </h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3 text-slate-600">
            <Mail className="size-4 shrink-0 text-brand-blue" />
            <a
              href={`mailto:${profile.email}`}
              className="truncate hover:text-brand-blue"
            >
              {profile.email}
            </a>
          </li>
          {profile.phone && (
            <li className="flex items-center gap-3 text-slate-600">
              <Phone className="size-4 shrink-0 text-brand-blue" />
              <a href={`tel:${profile.phone}`} className="hover:text-brand-blue">
                {profile.phone}
              </a>
            </li>
          )}
          <li className="flex items-center gap-3 text-slate-600">
            <MapPin className="size-4 shrink-0 text-brand-blue" />
            {profile.city}
          </li>
          {profile.website && (
            <li className="flex items-center gap-3 text-slate-600">
              <Globe className="size-4 shrink-0 text-brand-blue" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-brand-blue"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <Award className="size-4 text-brand-blue" />
          Uzmanlık Alanları
        </h2>
        <ul className="space-y-2">
          {profile.expertiseAreas.length > 0 ? (
            profile.expertiseAreas.map((area) => (
              <li
                key={area}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-brand-blue" />
                {area}
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">
              Henüz uzmanlık alanı eklenmemiş.
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <TrendingUp className="size-4 text-brand-blue" />
          Popüler İçerikleri
        </h2>
        <ol className="space-y-3">
          {popularContent.map((item, index) => (
            <li key={item.id}>
              <Link
                href={`/makaleler/${item.slug}`}
                className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-xs font-bold text-brand-blue">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-brand-navy group-hover:text-brand-blue">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.type} · {formatViewCount(item.viewCount)} görüntülenme
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {!isLoggedIn && (
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue via-blue-600 to-sky-500 p-5 shadow-lg shadow-brand-blue/20">
          <div className="space-y-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                TürkPDR Topluluğuna Katıl
              </h2>
              <p className="mt-1 text-sm text-white/85">
                Uzmanlarla bağlantı kurun, içerik paylaşın ve mesleki gelişiminizi
                destekleyin.
              </p>
            </div>
            <Button
              size="sm"
              className="w-full rounded-xl bg-white text-brand-blue hover:bg-white/90"
              asChild
            >
              <Link href="/kayit">
                Ücretsiz Üye Ol
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {isOwnProfile && (
        <section className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5">
          <h2 className="text-sm font-semibold text-brand-navy">
            Profil Ayarları
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Profil bilgilerinizi güncelleyin veya yeni içerik paylaşın.
          </p>
          <div className="mt-4 space-y-2">
            <Button className="w-full rounded-xl bg-brand-blue" asChild>
              <Link href="/paylasim/yeni">
                <Share2 className="size-4" />
                Paylaşım Yap
              </Link>
            </Button>
            <Button className="w-full rounded-xl" variant="outline" asChild>
              <Link href={`/profil/${profile.id}/duzenle`}>
                <PenLine className="size-4" />
                Profili Düzenle
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </aside>
  );
}
