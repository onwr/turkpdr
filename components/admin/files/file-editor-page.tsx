"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Save } from "lucide-react";
import type { ContentStatus } from "@prisma/client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { FileUploadField } from "@/components/admin/files/file-upload-field";
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
import { contentStatusLabels } from "@/types/content";
import {
  defaultFileFormState,
  type FileFormState,
} from "@/types/files";

const statusOptions: ContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
];

type FileEditorPageProps = {
  fileId?: string;
};

export function FileEditorPage({ fileId }: FileEditorPageProps) {
  const router = useRouter();
  const isEdit = !!fileId;

  const [form, setForm] = useState<FileFormState>(defaultFileFormState);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) return;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/files/${fileId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Dosya yüklenemedi.");

        const file = data.file;
        setForm({
          title: file.title,
          description: file.description ?? "",
          fileUrl: file.fileUrl,
          fileType: file.fileType ?? "",
          fileSize: file.fileSize?.toString() ?? "",
          status: file.status,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [fileId]);

  const updateForm = <K extends keyof FileFormState>(
    key: K,
    value: FileFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Dosya başlığı zorunludur.");
      return;
    }
    if (!form.fileUrl.trim()) {
      setError("PDF dosyası yüklenmesi zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      fileUrl: form.fileUrl.trim(),
      fileType: form.fileType.trim() || "PDF",
      fileSize: form.fileSize ? parseInt(form.fileSize, 10) : null,
      status: form.status,
    };

    try {
      const url = isEdit ? `/api/admin/files/${fileId}` : "/api/admin/files";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Kayıt işlemi başarısız.");

      router.push("/admin/files");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          Dosya yükleniyor...
        </div>
      </AdminLayout>
    );
  }

  if (error && isEdit && !form.title) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 space-y-2">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
          <Link href="/admin/files">
            <ArrowLeft className="size-4" />
            Dosyalar
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-brand-navy sm:text-2xl">
          {isEdit ? "Dosya Düzenle" : "Yeni Dosya"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4 text-brand-blue" />
                Dosya Bilgileri
              </CardTitle>
              <CardDescription>
                Başlık, açıklama ve PDF dosyası
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-title">Başlık *</Label>
                <Input
                  id="file-title"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="Örn: BDT Seans Formu"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-description">Açıklama</Label>
                <textarea
                  id="file-description"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Dosya hakkında kısa açıklama"
                  rows={4}
                  className="flex w-full resize-none rounded-xl border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <FileUploadField
                fileUrl={form.fileUrl}
                fileType={form.fileType}
                fileSize={form.fileSize}
                onChange={(data) =>
                  setForm((prev) => ({ ...prev, ...data }))
                }
              />
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Yayın Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-status">Durum</Label>
                <Select
                  id="file-status"
                  value={form.status}
                  onChange={(e) =>
                    updateForm("status", e.target.value as ContentStatus)
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {contentStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
                disabled={saving}
              >
                <Save className="size-4" />
                {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                asChild
                disabled={saving}
              >
                <Link href="/admin/files">İptal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminLayout>
  );
}
