import Link from "next/link";
import {
  Bookmark,
  ClipboardList,
  FileText,
  FolderOpen,
} from "lucide-react";

import { AccountContentList } from "@/components/account/account-content-list";
import { AccountFavoritesList } from "@/components/account/account-favorites-list";
import { AccountMessagesStatCard } from "@/components/account/account-messages-stat-card";
import { AccountStatCard } from "@/components/account/account-stat-card";
import { AccountRecentNotifications } from "@/components/account/account-recent-notifications";
import { AccountTestResults } from "@/components/account/account-test-results";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AccountSummary } from "@/types/account";

type AccountDashboardProps = {
  summary: AccountSummary;
};

export function AccountDashboard({ summary }: AccountDashboardProps) {
  const {
    stats,
    recentPosts,
    recentTestResults,
    recentFavorites,
    recentNotifications,
    unreadNotifications,
    profileCompletion,
  } = summary;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AccountStatCard
          label="Toplam Paylaşım"
          value={stats.totalPosts}
          icon={FileText}
          href="/hesabim/paylasimlar"
        />
        <AccountStatCard
          label="Onay Bekleyen"
          value={stats.pendingPosts}
          icon={FileText}
          accent="amber"
          href="/hesabim/paylasimlar"
        />
        <AccountStatCard
          label="Favoriler"
          value={stats.favorites}
          icon={Bookmark}
          accent="emerald"
          href="/hesabim/favoriler"
        />
        <AccountStatCard
          label="Test Sonuçları"
          value={stats.testResults}
          icon={ClipboardList}
          accent="violet"
          href="/hesabim/test-sonuclarim"
        />
        <AccountMessagesStatCard initialCount={stats.messages} />
        <AccountStatCard
          label="Dosyalar"
          value={stats.files}
          icon={FolderOpen}
          accent="slate"
          href="/hesabim/dosyalar"
        />
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Profil Tamamlanma</CardTitle>
          <CardDescription>
            Profilinizi tamamlayarak görünürlüğünüzü artırın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-brand-navy">
              %{profileCompletion} tamamlandı
            </span>
            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link href="/hesabim/profil">Profili Düzenle</Link>
            </Button>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-blue transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <AccountRecentNotifications
        items={recentNotifications}
        unreadCount={unreadNotifications}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-navy">
              Son Paylaşımlarım
            </h2>
            <Link
              href="/hesabim/paylasimlar"
              className="text-sm text-brand-blue hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          <AccountContentList
            items={recentPosts}
            emptyMessage="Henüz paylaşım yok."
            showCreateButton
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-navy">
              Son Test Sonuçlarım
            </h2>
            <Link
              href="/hesabim/test-sonuclarim"
              className="text-sm text-brand-blue hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          <AccountTestResults items={recentTestResults} />
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-navy">
            Son Favorilerim
          </h2>
          <Link
            href="/hesabim/favoriler"
            className="text-sm text-brand-blue hover:underline"
          >
            Tümünü gör
          </Link>
        </div>
        <AccountFavoritesList items={recentFavorites} />
      </section>
    </div>
  );
}
