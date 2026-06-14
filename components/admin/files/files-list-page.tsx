"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Download,
  FilePen,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import type { ContentStatus } from "@prisma/client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { contentStatusLabels } from "@/types/content";
import type { FileListItem } from "@/types/files";
import { formatFileSize } from "@/types/upload";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";

type UserRole = "ADMIN" | "EDITOR" | "AUTHOR" | "MEMBER";

const statusOptions: { value: ContentStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "DRAFT", label: "Taslak" },
  { value: "PENDING", label: "Onay Bekliyor" },
  { value: "PUBLISHED", label: "Yayında" },
  { value: "REJECTED", label: "Reddedildi" },
];

const statusStyles: Record<ContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-50 text-amber-700",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  REVISION_REQUESTED: "bg-orange-50 text-orange-700",
};

type FilesListPageProps = {
  userRole: UserRole;
};

export function FilesListPage({ userRole }: FilesListPageProps) {
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const canDelete = userRole === "ADMIN";

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    appendListPagination(params, page);

    try {
      const res = await fetch(`/api/admin/files?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Dosyalar yüklenemedi.");
      setFiles(data.files);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchFiles(), 300);
    return () => clearTimeout(timer);
  }, [fetchFiles]);

  const requestDelete = (id: string, title: string) => {
    setConfirmState({
      title: "Dosyayı Sil",
      description: `"${title}" dosyasını silmek istediğinize emin misiniz?`,
      confirmLabel: "Sil",
      variant: "destructive",
      onConfirm: async () => {
        setActionLoading(id);
        setError(null);
        setSuccess(null);
        try {
          const res = await fetch(`/api/admin/files/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Dosya silinemedi.");
          setSuccess(data.message || "Dosya silindi.");
          setConfirmState(null);
          await fetchFiles();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy sm:text-2xl">
            Dosya Yönetimi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dosya merkezi materyallerini yönetin.
          </p>
        </div>
        <Button
          className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
          asChild
        >
          <Link href="/admin/files/new">
            <Plus className="size-4" />
            Yeni Dosya
          </Link>
        </Button>
      </div>

      <AdminListAlerts error={error} success={success} />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Dosya adı veya tür ara..."
              className="rounded-xl pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ContentStatus | "");
              setPage(1);
            }}
            className="sm:w-48"
            aria-label="Durum filtresi"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl shrink-0"
            onClick={() => void fetchFiles()}
            aria-label="Yenile"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4 text-brand-blue" />
            Dosyalar
          </CardTitle>
          <CardDescription>{total} dosya listeleniyor</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Boyut</TableHead>
                  <TableHead>İndirme</TableHead>
                  <TableHead>Yükleyen</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && files.length === 0 ? (
                  <AdminTableLoadingRow colSpan={7} />
                ) : files.length === 0 ? (
                  <AdminTableEmptyRow colSpan={7} label="Dosya bulunamadı." />
                ) : (
                  files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="min-w-[160px]">
                          <p className="font-medium text-brand-navy">
                            {file.title}
                          </p>
                          {file.description && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {file.fileType ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {file.fileSize
                          ? formatFileSize(file.fileSize)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Download className="size-3.5" />
                          {file.downloads}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {file.uploadedBy.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusStyles[file.status]}
                        >
                          {contentStatusLabels[file.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            className="rounded-lg"
                            asChild
                          >
                            <Link href={`/admin/files/${file.id}/edit`}>
                              <FilePen className="size-3.5" />
                              <span className="hidden sm:inline">Düzenle</span>
                            </Link>
                          </Button>
                          {canDelete && (
                            <Button
                              size="xs"
                              variant="destructive"
                              className="rounded-lg"
                              disabled={actionLoading === file.id}
                              onClick={() =>
                                requestDelete(file.id, file.title)
                              }
                            >
                              <Trash2 className="size-3.5" />
                              <span className="hidden sm:inline">Sil</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <AdminConfirmDialog
        state={confirmState}
        loading={confirmLoading || actionLoading !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        onConfirm={() => void handleConfirm()}
      />
    </AdminLayout>
  );
}
