"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentStatus, UserRole } from "@prisma/client";

import { AssignedEditorSelect } from "@/components/admin/shared/assigned-editor-select";
import { ContentReviewActions } from "@/components/admin/shared/content-review-actions";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { Button } from "@/components/ui/button";
import type { DashboardPendingItem } from "@/types/admin";

type PendingContentTableProps = {
  items: DashboardPendingItem[];
  currentUserId: string;
  userRole: UserRole;
};

export function PendingContentTable({
  items,
  currentUserId,
  userRole,
}: PendingContentTableProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "mine">(
    "all"
  );

  const filteredItems = useMemo(() => {
    if (assignmentFilter === "mine") {
      return items.filter(
        (item) =>
          item.entityType === "file" ||
          item.assignedEditor?.id === currentUserId
      );
    }
    return items;
  }, [assignmentFilter, currentUserId, items]);

  async function updateFileStatus(
    item: DashboardPendingItem,
    status: ContentStatus
  ) {
    setActionLoading(item.id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/files/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "İşlem başarısız.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <section
      aria-labelledby="pending-content-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2
            id="pending-content-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            Bekleyen İçerikler
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Onay bekleyen {filteredItems.length} içerik
          </p>
        </div>

        {(userRole === "ADMIN" || userRole === "EDITOR") && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={assignmentFilter === "all" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setAssignmentFilter("all")}
            >
              Tüm Bekleyenler
            </Button>
            <Button
              size="sm"
              variant={assignmentFilter === "mine" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setAssignmentFilter("mine")}
            >
              Bana Atananlar
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                Başlık
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">Tür</th>
              <th className="px-3 py-3 font-medium text-muted-foreground">Yazar</th>
              <th className="px-3 py-3 font-medium text-muted-foreground">Tarih</th>
              <th className="px-3 py-3 font-medium text-muted-foreground">Durum</th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Atanan Editör
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  Bekleyen içerik bulunmuyor.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={`${item.entityType}-${item.id}`}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="max-w-[200px] truncate px-5 py-3.5 font-medium text-brand-navy sm:max-w-none sm:px-6">
                    {item.title}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {item.typeLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-muted-foreground">
                    {item.author}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted-foreground">
                    {item.date}
                  </td>
                  <td className="px-3 py-3.5">
                    <ContentStatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-3.5">
                    {item.entityType === "content" ? (
                      <AssignedEditorSelect
                        contentId={item.id}
                        value={item.assignedEditor?.id ?? null}
                        disabled={actionLoading === item.id}
                        onAssigned={() => router.refresh()}
                        onError={setError}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    {item.entityType === "content" ? (
                      <ContentReviewActions
                        contentId={item.id}
                        title={item.title}
                        editUrl={item.editUrl}
                        assignedEditorId={item.assignedEditor?.id ?? null}
                        loading={actionLoading === item.id}
                        compact
                        onSuccess={() => router.refresh()}
                        onError={setError}
                        onLoadingChange={setActionLoading}
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          size="xs"
                          className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => void updateFileStatus(item, "PUBLISHED")}
                          disabled={actionLoading === item.id}
                        >
                          Onayla
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          className="rounded-lg"
                          onClick={() => void updateFileStatus(item, "REJECTED")}
                          disabled={actionLoading === item.id}
                        >
                          Reddet
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
