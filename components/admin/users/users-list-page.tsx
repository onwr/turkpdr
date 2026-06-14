"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import type { UserRole, UserStatus } from "@prisma/client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatContentDate } from "@/lib/admin/content-display";
import {
  userRoleLabels,
  userRoleStyles,
  userStatusLabels,
  userStatusStyles,
  type AdminUserDetail,
  type AdminUserListItem,
} from "@/types/admin";
import { cn } from "@/lib/utils";

type UsersListPageProps = {
  userRole: UserRole;
  currentUserId: string;
};

const roleOptions: { value: UserRole | ""; label: string }[] = [
  { value: "", label: "Tüm Roller" },
  { value: "ADMIN", label: "Yönetici" },
  { value: "EDITOR", label: "Editör" },
  { value: "AUTHOR", label: "Yazar" },
  { value: "MEMBER", label: "Üye" },
];

const statusOptions: { value: UserStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "PASSIVE", label: "Pasif" },
  { value: "BANNED", label: "Yasaklı" },
];

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        userRoleStyles[role]
      )}
    >
      {userRoleLabels[role]}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        userStatusStyles[status]
      )}
    >
      {userStatusLabels[status]}
    </span>
  );
}

export function UsersListPage({ userRole, currentUserId }: UsersListPageProps) {
  const canManage = userRole === "ADMIN";
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    type: "role" | "status";
    value: UserRole | UserStatus;
    label: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Üyeler yüklenemedi.");
      }
      const data = (await res.json()) as {
        users: AdminUserListItem[];
        totalPages: number;
      };
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Üyeler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  async function openDetail(userId: string) {
    setDetailLoading(true);
    setDetailUser(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Detay yüklenemedi.");
      }
      const data = (await res.json()) as { user: AdminUserDetail };
      setDetailUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detay yüklenemedi.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function applyConfirmAction() {
    if (!confirmAction) return;

    const { userId, type, value } = confirmAction;
    setActionLoading(userId);

    const url =
      type === "role"
        ? `/api/admin/users/${userId}/role`
        : `/api/admin/users/${userId}/status`;

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "role" ? { role: value } : { status: value }
        ),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Güncelleme başarısız.");
      }

      const data = (await res.json()) as { user: AdminUserListItem };
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? data.user : u))
      );
      if (detailUser?.id === userId) {
        setDetailUser((prev) =>
          prev ? { ...prev, ...data.user } : prev
        );
      }
      setConfirmAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncelleme başarısız.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Üye Yönetimi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform üyelerini görüntüleyin ve yönetin.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Ad veya e-posta ara..."
            className="rounded-xl pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | "");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Rol filtresi"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as UserStatus | "");
            setPage(1);
          }}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          aria-label="Durum filtresi"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => void fetchUsers()}
          aria-label="Yenile"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  Ad
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  E-posta
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">Rol</th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Durum
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  Kayıt Tarihi
                </th>
                <th className="px-3 py-3 font-medium text-muted-foreground">
                  İçerik
                </th>
                <th className="px-5 py-3 font-medium text-muted-foreground sm:px-6">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Yükleniyor...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Üye bulunamadı.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isBusy = actionLoading === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3.5 font-medium text-brand-navy sm:px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                            {user.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatar}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <Users className="size-3.5 text-slate-400" />
                            )}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-3 py-3.5">
                        {canManage && !isSelf ? (
                          <select
                            value={user.role}
                            disabled={isBusy}
                            onChange={(e) =>
                              setConfirmAction({
                                userId: user.id,
                                type: "role",
                                value: e.target.value as UserRole,
                                label: `${user.name} kullanıcısının rolünü "${userRoleLabels[e.target.value as UserRole]}" olarak değiştirmek istediğinize emin misiniz?`,
                              })
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                          >
                            {roleOptions
                              .filter((o) => o.value)
                              .map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <RoleBadge role={user.role} />
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        {canManage && !(isSelf && user.status === "ACTIVE") ? (
                          <select
                            value={user.status}
                            disabled={isBusy || (isSelf && user.status !== "ACTIVE")}
                            onChange={(e) =>
                              setConfirmAction({
                                userId: user.id,
                                type: "status",
                                value: e.target.value as UserStatus,
                                label: `${user.name} kullanıcısının durumunu "${userStatusLabels[e.target.value as UserStatus]}" olarak değiştirmek istediğinize emin misiniz?`,
                              })
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                          >
                            {statusOptions
                              .filter((o) => o.value)
                              .map((opt) => (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                  disabled={isSelf && opt.value !== "ACTIVE"}
                                >
                                  {opt.label}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <StatusBadge status={user.status} />
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {formatContentDate(user.createdAt)}
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {user.contentCount}
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <Button
                          size="xs"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => void openDetail(user.id)}
                        >
                          <Eye className="size-3.5" />
                          Detay
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 sm:px-6">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
            </Button>
          </div>
        )}
      </section>

      <Dialog
        open={detailUser !== null || detailLoading}
        onOpenChange={(open) => {
          if (!open) setDetailUser(null);
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayı</DialogTitle>
            <DialogDescription>
              Kullanıcı profil ve aktivite bilgileri
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Yükleniyor...
            </p>
          ) : detailUser ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                  {detailUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detailUser.avatar}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <Users className="size-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-brand-navy">
                    {detailUser.name}
                  </p>
                  <p className="text-muted-foreground">{detailUser.email}</p>
                  <div className="mt-1 flex gap-2">
                    <RoleBadge role={detailUser.role} />
                    <StatusBadge status={detailUser.status} />
                  </div>
                </div>
              </div>
              {detailUser.title && (
                <p>
                  <span className="font-medium">Ünvan:</span> {detailUser.title}
                </p>
              )}
              {detailUser.bio && (
                <p>
                  <span className="font-medium">Hakkında:</span> {detailUser.bio}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                <p>İçerik: {detailUser.contentCount}</p>
                <p>Yorum: {detailUser.commentCount}</p>
                <p>Dosya: {detailUser.fileCount}</p>
                <p>
                  Kayıt: {formatContentDate(detailUser.createdAt)}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Değişikliği Onayla"
        description={confirmAction?.label ?? ""}
        confirmLabel="Onayla"
        loading={actionLoading !== null}
        onConfirm={() => void applyConfirmAction()}
      />
    </AdminLayout>
  );
}
