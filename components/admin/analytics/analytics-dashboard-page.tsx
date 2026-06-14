"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Download,
  Eye,
  Loader2,
  MessageSquare,
  Newspaper,
  RefreshCw,
  ThumbsUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  AnalyticsDashboardData,
  AnalyticsRange,
  AnalyticsStatItem,
} from "@/types/analytics";
import { ANALYTICS_RANGE_OPTIONS } from "@/types/analytics";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "#2563eb",
  "#6366f1",
  "#0ea5e9",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const statIconMap = {
  views: Eye,
  downloads: Download,
  tests: ClipboardList,
  members: Users,
  published: Newspaper,
  likes: ThumbsUp,
  comments: MessageSquare,
} as const;

const statColorMap = {
  views: "bg-sky-50 text-sky-600",
  downloads: "bg-amber-50 text-amber-600",
  tests: "bg-violet-50 text-violet-600",
  members: "bg-blue-50 text-brand-blue",
  published: "bg-indigo-50 text-indigo-600",
  likes: "bg-rose-50 text-rose-600",
  comments: "bg-emerald-50 text-emerald-600",
} as const;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function AnalyticsStatCard({ stat }: { stat: AnalyticsStatItem }) {
  const Icon = statIconMap[stat.icon];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          statColorMap[stat.icon]
        )}
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-brand-navy">
        {formatNumber(stat.value)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
    </article>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function RankingTable({
  title,
  description,
  emptyMessage,
  rows,
  valueLabel,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  rows: {
    id: string;
    title: string;
    subtitle?: string;
    value: number;
    href?: string;
    externalHref?: string | null;
  }[];
  valueLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-muted-foreground">
                  <th className="pb-3 pr-3 font-medium">#</th>
                  <th className="pb-3 pr-3 font-medium">Başlık</th>
                  <th className="pb-3 text-right font-medium">{valueLabel}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-3 text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="space-y-0.5">
                        {row.href ? (
                          <Link
                            href={row.href}
                            className="font-medium text-brand-navy hover:text-brand-blue"
                          >
                            {row.title}
                          </Link>
                        ) : row.externalHref ? (
                          <a
                            href={row.externalHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-brand-navy hover:text-brand-blue"
                          >
                            {row.title}
                          </a>
                        ) : (
                          <p className="font-medium text-brand-navy">
                            {row.title}
                          </p>
                        )}
                        {row.subtitle && (
                          <p className="text-xs text-muted-foreground">
                            {row.subtitle}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold text-brand-navy">
                      {formatNumber(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboardPage() {
  const [range, setRange] = useState<AnalyticsRange>("30");
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Analitik verileri yüklenemedi.");
      }
      setData(json);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error ? err.message : "Analitik verileri yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAnalytics();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  const hasChartData =
    data &&
    (data.contentPublishingChart.some((point) => point.count > 0) ||
      data.memberRegistrationChart.some((point) => point.count > 0) ||
      data.contentTypeDistribution.length > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-brand-navy">
                  Analytics
                </h2>
                <p className="text-sm text-muted-foreground">
                  Site performansı ve içerik etkileşimleri
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
              {ANALYTICS_RANGE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={range === option.value ? "default" : "ghost"}
                  className={cn(
                    "rounded-lg",
                    range === option.value && "bg-brand-blue hover:bg-brand-blue/90"
                  )}
                  onClick={() => setRange(option.value)}
                  disabled={loading}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void fetchAnalytics()}
              disabled={loading}
            >
              <RefreshCw
                className={cn("size-4", loading && "animate-spin")}
              />
              Yenile
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-xl border-red-200 bg-white"
                onClick={() => void fetchAnalytics()}
              >
                Tekrar Dene
              </Button>
            </div>
          </div>
        )}

        {loading && !data ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" />
            Analitik veriler yükleniyor...
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 2xl:grid-cols-7">
              {data.stats.map((stat) => (
                <AnalyticsStatCard key={stat.id} stat={stat} />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>İçerik Yayınlama</CardTitle>
                  <CardDescription>
                    {data.rangeLabel} döneminde yayınlanan içerikler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.contentPublishingChart.some((point) => point.count > 0) ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.contentPublishingChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              formatNumber(Number(value)),
                              "İçerik",
                            ]}
                          />
                          <Bar
                            dataKey="count"
                            fill="#2563eb"
                            radius={[6, 6, 0, 0]}
                            name="İçerik"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChartState message="Bu dönemde yayınlanan içerik bulunamadı." />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Üye Kayıtları</CardTitle>
                  <CardDescription>
                    {data.rangeLabel} döneminde yeni üye kayıtları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.memberRegistrationChart.some((point) => point.count > 0) ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.memberRegistrationChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              formatNumber(Number(value)),
                              "Üye",
                            ]}
                          />
                          <Bar
                            dataKey="count"
                            fill="#6366f1"
                            radius={[6, 6, 0, 0]}
                            name="Üye"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChartState message="Bu dönemde üye kaydı bulunamadı." />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>İçerik Türü Dağılımı</CardTitle>
                <CardDescription>
                  {data.rangeLabel} döneminde yayınlanan içerik türleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.contentTypeDistribution.length > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.contentTypeDistribution}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                          >
                            {data.contentTypeDistribution.map((entry, index) => (
                              <Cell
                                key={entry.type}
                                fill={
                                  CHART_COLORS[index % CHART_COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, _name, item) => [
                              formatNumber(Number(value)),
                              item.payload?.label ?? "İçerik",
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {data.contentTypeDistribution.map((slice, index) => (
                        <div
                          key={slice.type}
                          className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  CHART_COLORS[index % CHART_COLORS.length],
                              }}
                            />
                            <span className="text-brand-navy">{slice.label}</span>
                          </div>
                          <span className="font-semibold text-brand-navy">
                            {formatNumber(slice.count)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyChartState message="İçerik türü dağılımı için veri bulunamadı." />
                )}
              </CardContent>
            </Card>

            {!hasChartData &&
              data.stats.every((stat) => stat.value === 0) &&
              data.topReadContent.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                  <BarChart3 className="mx-auto size-10 text-slate-300" />
                  <p className="mt-4 font-medium text-brand-navy">
                    Henüz analitik veri yok
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    İçerik yayınlandıkça ve kullanıcı etkileşimi arttıkça
                    istatistikler burada görünecek.
                  </p>
                </div>
              )}

            <div className="grid gap-6 xl:grid-cols-2">
              <RankingTable
                title="En Çok Okunan İçerikler"
                description="Görüntülenme sayısına göre sıralama"
                emptyMessage="Bu dönemde görüntülenen içerik bulunamadı."
                valueLabel="Görüntülenme"
                rows={data.topReadContent.map((item) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: `${item.typeLabel} · ${item.authorName}`,
                  value: item.value,
                  href: item.editUrl,
                  externalHref: item.viewUrl,
                }))}
              />

              <RankingTable
                title="En Çok İndirilen Dosyalar"
                description="İndirme sayısına göre sıralama"
                emptyMessage="Bu dönemde indirilen dosya bulunamadı."
                valueLabel="İndirme"
                rows={data.topDownloadedFiles.map((item) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: item.uploadedBy,
                  value: item.value,
                  href: item.editUrl,
                }))}
              />

              <RankingTable
                title="En Çok Çözülen Testler"
                description="Test çözüm sayısına göre sıralama"
                emptyMessage="Bu dönemde çözülen test bulunamadı."
                valueLabel="Çözüm"
                rows={data.topCompletedTests.map((item) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: item.slug,
                  value: item.value,
                  href: item.editUrl,
                }))}
              />

              <RankingTable
                title="En Aktif Yazarlar"
                description="Yayınlanan içerik sayısına göre sıralama"
                emptyMessage="Bu dönemde aktif yazar bulunamadı."
                valueLabel="İçerik"
                rows={data.topAuthors.map((item) => ({
                  id: item.id,
                  title: item.name,
                  value: item.value,
                  href: `/admin/authors`,
                }))}
              />

              <RankingTable
                title="En Çok Beğenilen İçerikler"
                description="Beğeni sayısına göre sıralama"
                emptyMessage="Bu dönemde beğeni alan içerik bulunamadı."
                valueLabel="Beğeni"
                rows={data.topLikedContent.map((item) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: `${item.typeLabel} · ${item.authorName}`,
                  value: item.value,
                  href: item.editUrl,
                  externalHref: item.viewUrl,
                }))}
              />

              <RankingTable
                title="En Çok Yorum Alan İçerikler"
                description="Yorum sayısına göre sıralama"
                emptyMessage="Bu dönemde yorum alan içerik bulunamadı."
                valueLabel="Yorum"
                rows={data.topCommentedContent.map((item) => ({
                  id: item.id,
                  title: item.title,
                  subtitle: `${item.typeLabel} · ${item.authorName}`,
                  value: item.value,
                  href: item.editUrl,
                  externalHref: item.viewUrl,
                }))}
              />
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
