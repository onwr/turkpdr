"use client";

import { useCallback, useEffect, useState } from "react";
import { History, Loader2, RefreshCw, Search } from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ActivityFilterOptions,
  ActivityLogItem,
} from "@/types/activity";
import { cn } from "@/lib/utils";

type ActivityUserOption = {
  id: string;
  name: string;
};

export function ActivityListPage() {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [filters, setFilters] = useState<ActivityFilterOptions | null>(null);
  const [users, setUsers] = useState<ActivityUserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?limit=100&page=1");
      const data = await res.json();
      if (res.ok) {
        setUsers(
          data.users.map((user: { id: string; name: string }) => ({
            id: user.id,
            name: user.name,
          }))
        );
      }
    } catch {
      // Filter still works without user list.
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (search.trim()) params.set("search", search.trim());
    if (userId) params.set("userId", userId);
    if (action) params.set("action", action);
    if (entityType) params.set("entityType", entityType);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    try {
      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Aktivite geçmişi yüklenemedi.");
      }

      setActivities(data.activities);
      setFilters(data.filters);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Aktivite geçmişi yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  }, [search, userId, action, entityType, dateFrom, dateTo, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchActivities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchActivities]);

  function resetFilters() {
    setSearch("");
    setUserId("");
    setAction("");
    setEntityType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <History className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-navy">
                Aktivite Geçmişi
              </h2>
              <p className="text-sm text-muted-foreground">
                Sistemdeki önemli işlemlerin kaydı
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => void fetchActivities()}
            disabled={loading}
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Yenile
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <div className="relative md:col-span-2 xl:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Açıklama veya kullanıcı ara..."
                className="rounded-xl pl-9"
              />
            </div>

            <select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setPage(1);
              }}
              className="flex h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:bg-white"
            >
              <option value="">Tüm kullanıcılar</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="flex h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:bg-white"
            >
              <option value="">Tüm işlemler</option>
              {filters?.actions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="flex h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:bg-white"
            >
              <option value="">Tüm entity tipleri</option>
              {filters?.entityTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="rounded-xl"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="rounded-xl"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={resetFilters}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
          {loading && activities.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Yükleniyor...
            </div>
          ) : activities.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <History className="mx-auto size-10 text-slate-300" />
              <p className="mt-4 font-medium text-brand-navy">
                Aktivite kaydı bulunamadı
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Seçili filtrelere uygun kayıt yok.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Tarih</th>
                    <th className="px-5 py-3 font-medium">Kullanıcı</th>
                    <th className="px-5 py-3 font-medium">İşlem</th>
                    <th className="px-5 py-3 font-medium">Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {item.createdAtLabel}
                      </td>
                      <td className="px-5 py-4">
                        {item.user ? (
                          <div>
                            <p className="font-medium text-brand-navy">
                              {item.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sistem</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="rounded-lg bg-slate-100 text-brand-navy"
                          >
                            {item.action}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {item.actionLabel}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-brand-navy">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 px-5 py-4">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              loading={loading}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
