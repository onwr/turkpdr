"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FolderOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { ContentType } from "@prisma/client";

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
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { contentTypeLabels } from "@/types/content";
import {
  defaultCategoryFormState,
  type CategoryFormState,
  type CategoryListItem,
} from "@/types/admin-crud";
import { appendListPagination } from "@/lib/admin/list-fetch";
import { cn } from "@/lib/utils";

type UserRole = "ADMIN" | "EDITOR" | "AUTHOR" | "MEMBER";

const typeOptions: { value: ContentType | ""; label: string }[] = [
  { value: "", label: "Tüm Türler" },
  { value: "NEWS", label: "Haber" },
  { value: "ARTICLE", label: "Makale" },
  { value: "GUIDE", label: "Rehberlik Yazısı" },
  { value: "METAPHOR", label: "Terapi Metaforu" },
  { value: "PSIKO_SANAT", label: "Psiko Sanat Kitap" },
  { value: "VIDEO", label: "Video" },
  { value: "FILE", label: "Dosya" },
];

const formTypeOptions = typeOptions.filter((o) => o.value !== "");

type CategoriesListPageProps = {
  userRole: UserRole;
};

export function CategoriesListPage({ userRole }: CategoriesListPageProps) {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(defaultCategoryFormState);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<AdminConfirmState | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const canDelete = userRole === "ADMIN";

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (typeFilter) params.set("type", typeFilter);
    appendListPagination(params, page);

    try {
      const res = await fetch(`/api/admin/categories?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kategoriler yüklenemedi.");
      setCategories(data.categories);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchCategories(), 300);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultCategoryFormState);
    setModalOpen(true);
    setSuccess(null);
    setError(null);
  };

  const openEditModal = (category: CategoryListItem) => {
    setEditingId(category.id);
    setForm({ name: category.name, type: category.type });
    setModalOpen(true);
    setSuccess(null);
    setError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultCategoryFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Kategori adı zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "İşlem başarısız.");

      setSuccess(data.message || "İşlem başarılı.");
      closeModal();
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id: string, name: string) => {
    setConfirmState({
      title: "Kategoriyi Sil",
      description: `"${name}" kategorisini silmek istediğinize emin misiniz?`,
      confirmLabel: "Sil",
      variant: "destructive",
      onConfirm: async () => {
        setActionLoading(id);
        setError(null);
        setSuccess(null);
        try {
          const res = await fetch(`/api/admin/categories/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Kategori silinemedi.");
          setSuccess(data.message || "Kategori silindi.");
          setConfirmState(null);
          await fetchCategories();
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
            Kategori Yönetimi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            İçerik ve test kategorilerini yönetin.
          </p>
        </div>
        <Button
          className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
          onClick={openCreateModal}
        >
          <Plus className="size-4" />
          Yeni Kategori
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
              placeholder="Kategori adı veya slug ara..."
              className="rounded-xl pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as ContentType | "");
              setPage(1);
            }}
            className="sm:w-48"
            aria-label="Tür filtresi"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl shrink-0"
            onClick={() => void fetchCategories()}
            aria-label="Yenile"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="size-4 text-brand-blue" />
            Kategoriler
          </CardTitle>
          <CardDescription>
            {total} kategori listeleniyor
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>İçerik</TableHead>
                <TableHead>Test</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && categories.length === 0 ? (
                <AdminTableLoadingRow colSpan={6} />
              ) : categories.length === 0 ? (
                <AdminTableEmptyRow colSpan={6} label="Kategori bulunamadı." />
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-brand-navy">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {contentTypeLabels[category.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{category._count.contents}</TableCell>
                    <TableCell>{category._count.tests}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="xs"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => openEditModal(category)}
                        >
                          <Pencil className="size-3.5" />
                          <span className="hidden sm:inline">Düzenle</span>
                        </Button>
                        {canDelete && (
                          <Button
                            size="xs"
                            variant="destructive"
                            className="rounded-lg"
                            disabled={actionLoading === category.id}
                            onClick={() =>
                              requestDelete(category.id, category.name)
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <Card className="relative z-10 w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>
                  {editingId ? "Kategori Düzenle" : "Yeni Kategori"}
                </CardTitle>
                <CardDescription>
                  Slug otomatik oluşturulur.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={closeModal}
                aria-label="Kapat"
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Kategori Adı</Label>
                  <Input
                    id="category-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Örn: Ergen Psikolojisi"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-type">Tür</Label>
                  <Select
                    id="category-type"
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        type: e.target.value as ContentType,
                      }))
                    }
                  >
                    {formTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-brand-blue"
                    disabled={saving}
                  >
                    {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Oluştur"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
