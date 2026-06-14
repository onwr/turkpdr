"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ClipboardList, Save } from "lucide-react";
import type { ContentStatus } from "@prisma/client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { SeoPanel } from "@/components/admin/editor/seo-panel";
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
  defaultTestFormState,
  type TestFormState,
} from "@/types/admin-crud";
import { seoFieldsFromRecord } from "@/types/seo";
import { SchedulePublishField } from "@/components/admin/shared/schedule-publish-field";
import { formatScheduledAtForInput } from "@/lib/scheduling/utils";

type CategoryOption = { id: string; name: string };

const statusOptions: ContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
];

type TestEditorPageProps = {
  testId?: string;
};

export function TestEditorPage({ testId }: TestEditorPageProps) {
  const router = useRouter();
  const isEdit = !!testId;

  const [form, setForm] = useState<TestFormState>(defaultTestFormState);
  const [testSlug, setTestSlug] = useState<string | undefined>();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (res.ok) setCategories(data.categories);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    if (!testId) return;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/tests/${testId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Test yüklenemedi.");

        const test = data.test;
        setForm({
          title: test.title,
          description: test.description ?? "",
          image: test.image ?? "",
          duration: test.duration ?? "",
          questionCount: test.questionCount?.toString() ?? "",
          iframeUrl: test.iframeUrl ?? "",
          status: test.status,
          scheduledAt: formatScheduledAtForInput(test.scheduledAt),
          categoryId: test.categoryId ?? "",
          seo: seoFieldsFromRecord(test),
        });
        setTestSlug(test.slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [testId]);

  const updateForm = <K extends keyof TestFormState>(
    key: K,
    value: TestFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Test başlığı zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      duration: form.duration.trim() || null,
      questionCount: form.questionCount
        ? parseInt(form.questionCount, 10)
        : null,
      iframeUrl: form.iframeUrl.trim() || null,
      status: form.status,
      scheduledAt: form.scheduledAt || null,
      categoryId: form.categoryId || null,
      ...form.seo,
    };

    try {
      const url = isEdit ? `/api/admin/tests/${testId}` : "/api/admin/tests";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Kayıt işlemi başarısız.");

      setSuccess(data.message || "Test kaydedildi.");
      router.push("/admin/tests");
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
          Test yükleniyor...
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
          <Link href="/admin/tests">
            <ArrowLeft className="size-4" />
            Testler
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-brand-navy sm:text-2xl">
          {isEdit ? "Test Düzenle" : "Yeni Test"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Slug otomatik oluşturulur.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4 text-brand-blue" />
                Test Bilgileri
              </CardTitle>
              <CardDescription>
                Test içeriği ve teknik ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-title">Başlık *</Label>
                <Input
                  id="test-title"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="Örn: Beck Depresyon Testi"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-description">Açıklama</Label>
                <textarea
                  id="test-description"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Test hakkında kısa açıklama"
                  rows={4}
                  className="flex w-full resize-none rounded-xl border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="test-duration">Süre (dk)</Label>
                  <Input
                    id="test-duration"
                    value={form.duration}
                    onChange={(e) => updateForm("duration", e.target.value)}
                    placeholder="10"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-questions">Soru Sayısı</Label>
                  <Input
                    id="test-questions"
                    type="number"
                    min={0}
                    value={form.questionCount}
                    onChange={(e) =>
                      updateForm("questionCount", e.target.value)
                    }
                    placeholder="21"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-image">Görsel URL</Label>
                <Input
                  id="test-image"
                  value={form.image}
                  onChange={(e) => updateForm("image", e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-iframe">Iframe URL</Label>
                <Input
                  id="test-iframe"
                  value={form.iframeUrl}
                  onChange={(e) => updateForm("iframeUrl", e.target.value)}
                  placeholder="Test embed URL'si"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Yayın Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-status">Durum</Label>
                  <Select
                    id="test-status"
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
                <SchedulePublishField
                  value={form.scheduledAt}
                  onChange={(value) => updateForm("scheduledAt", value)}
                  id="test-scheduled-at"
                />
                <div className="space-y-2">
                  <Label htmlFor="test-category">Kategori</Label>
                  <Select
                    id="test-category"
                    value={form.categoryId}
                    onChange={(e) => updateForm("categoryId", e.target.value)}
                  >
                    <option value="">Kategori seçin...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
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
                  <Link href="/admin/tests">İptal</Link>
                </Button>
                {isEdit && testId && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full rounded-xl"
                    asChild
                  >
                    <Link href={`/admin/tests/${testId}/questions`}>
                      <ClipboardList className="size-4" />
                      Soruları Yönet
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <SeoPanel
              seo={form.seo}
              onSeoChange={(key, value) =>
                setForm((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, [key]: value },
                }))
              }
              preview={{
                title: form.title || "Test başlığı",
                slug: testSlug,
                pathPrefix: "/test-merkezi",
                fallbackDescription: form.description,
                defaultImage: form.image || null,
              }}
              onUseDefaultImage={
                form.image
                  ? () =>
                      setForm((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, ogImage: prev.image },
                      }))
                  : undefined
              }
              defaultImageLabel="Test görselini kullan"
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
