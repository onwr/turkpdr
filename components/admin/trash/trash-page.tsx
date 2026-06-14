"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type { UserRole } from "@prisma/client";

import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminConfirmDialog,
  type AdminConfirmState,
} from "@/components/admin/shared/admin-confirm-dialog";
import { AdminListAlerts } from "@/components/admin/shared/admin-list-alerts";
import { AdminPagination } from "@/components/admin/shared/admin-pagination";
import {
  AdminTableEmptyRow,
  AdminTableLoadingRow,
} from "@/components/admin/shared/admin-table-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatContentDate } from "@/lib/admin/content-display";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";
import {
  TRASH_ENTITIES,
  trashEntityLabels,
  type TrashEntity,
  type TrashListItem,
} from "@/types/trash";

type TrashPageProps = {
  userRole: UserRole;
};

export function TrashPage({ userRole }: TrashPageProps) {
  const [activeTab, setActiveTab] = useState<TrashEntity>("contents");
  const [items, setItems] = useState<TrashListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const canPermanentDelete = userRole === "ADMIN";
  const canRestore = userRole === "ADMIN" || userRole === "EDITOR";

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("entity", activeTab);
    appendListPagination(params, page, 20);
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(`/api/admin/trash?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Çöp kutusu yüklenemedi.");
      }

      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchTrash();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTrash]);

  const handleTabChange = (tab: TrashEntity) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleRestore = async (item: TrashListItem) => {
    setActionLoading(`restore-${item.id}`);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/trash/${activeTab}/${item.id}/restore`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Geri yükleme başarısız.");
      }

      await fetchTrash();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (item: TrashListItem) => {
    setActionLoading(`delete-${item.id}`);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/trash/${activeTab}/${item.id}/permanent`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kalıcı silme başarısız.");
      }

      await fetchTrash();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  const openRestoreConfirm = (item: TrashListItem) => {
    setConfirmState({
      title: "Geri yükle",
      description: `"${item.title}" kaydını geri yüklemek istediğinize emin misiniz?`,
      confirmLabel: "Geri Yükle",
      onConfirm: () => void handleRestore(item),
    });
  };

  const openPermanentConfirm = (item: TrashListItem) => {
    setConfirmState({
      title: "Kalıcı sil",
      description: `"${item.title}" kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
      confirmLabel: "Kalıcı Sil",
      variant: "destructive",
      onConfirm: () => void handlePermanentDelete(item),
    });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
      setConfirmState(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-brand-navy sm:text-2xl">
            <Trash2 className="size-5 text-brand-blue" />
            Çöp Kutusu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Silinen kayıtları geri yükleyin veya kalıcı olarak kaldırın.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => void fetchTrash()}
          disabled={loading}
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Yenile
        </Button>
      </div>

      <AdminListAlerts error={error} />

      <div className="mb-4 flex flex-wrap gap-2">
        {TRASH_ENTITIES.map((entity) => (
          <Button
            key={entity}
            type="button"
            size="sm"
            variant={activeTab === entity ? "default" : "outline"}
            className="rounded-full"
            onClick={() => handleTabChange(entity)}
          >
            {trashEntityLabels[entity]}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Çöp kutusunda ara..."
            className="rounded-xl pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Başlık</th>
                <th className="px-3 py-3 font-medium">Detay</th>
                <th className="px-3 py-3 font-medium">Silinme</th>
                <th className="px-5 py-3 text-right font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminTableLoadingRow colSpan={4} />
              ) : items.length === 0 ? (
                <AdminTableEmptyRow
                  colSpan={4}
                  label={`${trashEntityLabels[activeTab]} sekmesinde silinmiş kayıt bulunmuyor.`}
                />
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-brand-navy">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {item.subtitle}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {item.meta ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                      {formatContentDate(item.deletedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        {canRestore && (
                          <Button
                            size="xs"
                            variant="outline"
                            className="rounded-lg"
                            disabled={actionLoading === `restore-${item.id}`}
                            onClick={() => openRestoreConfirm(item)}
                          >
                            {actionLoading === `restore-${item.id}` ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="size-3.5" />
                            )}
                            <span className="hidden sm:inline">Geri Yükle</span>
                          </Button>
                        )}
                        {canPermanentDelete && (
                          <Button
                            size="xs"
                            variant="destructive"
                            className="rounded-lg"
                            disabled={actionLoading === `delete-${item.id}`}
                            onClick={() => openPermanentConfirm(item)}
                          >
                            {actionLoading === `delete-${item.id}` ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                            <span className="hidden sm:inline">Kalıcı Sil</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <AdminConfirmDialog
        state={confirmState}
        loading={confirmLoading}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        onConfirm={() => void handleConfirm()}
      />
    </AdminLayout>
  );
}
