"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import type { DictionaryStatus } from "@prisma/client";

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
import { Textarea } from "@/components/ui/textarea";
import {
  DICTIONARY_CATEGORIES,
  defaultDictionaryFormState,
  dictionaryStatusLabels,
  type DictionaryFormState,
} from "@/types/dictionary";
import { seoFieldsFromRecord } from "@/types/seo";
import { SchedulePublishField } from "@/components/admin/shared/schedule-publish-field";
import { formatScheduledAtForInput } from "@/lib/scheduling/utils";

const statusOptions: DictionaryStatus[] = ["DRAFT", "PUBLISHED"];

type DictionaryEditorPageProps = {
  termId?: string;
};

export function DictionaryEditorPage({ termId }: DictionaryEditorPageProps) {
  const router = useRouter();
  const isEdit = !!termId;

  const [form, setForm] = useState<DictionaryFormState>(defaultDictionaryFormState);
  const [termSlug, setTermSlug] = useState<string | undefined>();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!termId) return;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/dictionary/${termId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Terim yüklenemedi.");

        const term = data.term;
        setForm({
          title: term.title,
          shortDescription: term.shortDescription ?? "",
          content: term.content ?? "",
          category: term.category ?? "",
          status: term.status,
          scheduledAt: formatScheduledAtForInput(term.scheduledAt),
          seo: seoFieldsFromRecord(term),
        });
        setTermSlug(term.slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [termId]);

  const updateForm = <K extends keyof DictionaryFormState>(
    key: K,
    value: DictionaryFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Terim başlığı zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim() || null,
      content: form.content.trim() || null,
      category: form.category.trim() || null,
      status: form.status,
      scheduledAt: form.scheduledAt || null,
      ...form.seo,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/dictionary/${termId}` : "/api/admin/dictionary",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız.");

      setSuccess(data.message || "Terim kaydedildi.");

      if (!isEdit && data.term?.id) {
        setTermSlug(data.term.slug);
        router.push(`/admin/dictionary/${data.term.id}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-muted-foreground">
          Yükleniyor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 rounded-xl" asChild>
          <Link href="/admin/dictionary">
            <ArrowLeft className="size-4" />
            Sözlüğe Dön
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-brand-navy sm:text-2xl">
          {isEdit ? "Terim Düzenle" : "Yeni Terim"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Psikoloji ve PDR terimi ekleyin veya güncelleyin.
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-4 text-brand-blue" />
                  Terim Bilgileri
                </CardTitle>
                <CardDescription>
                  Başlık ve açıklamalar SEO için önemlidir.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Terim Başlığı *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="Örn: Bilişsel Davranışçı Terapi"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Kısa Açıklama</Label>
                  <Textarea
                    id="shortDescription"
                    value={form.shortDescription}
                    onChange={(e) =>
                      updateForm("shortDescription", e.target.value)
                    }
                    placeholder="Terimin kısa tanımı (liste ve arama sonuçlarında görünür)"
                    className="min-h-[80px] rounded-xl"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Detaylı İçerik</Label>
                  <Textarea
                    id="content"
                    value={form.content}
                    onChange={(e) => updateForm("content", e.target.value)}
                    placeholder="Terimin detaylı açıklaması, örnekler ve kullanım alanları..."
                    className="min-h-[240px] rounded-xl"
                    rows={12}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Yayın Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    id="category"
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    className="rounded-xl"
                  >
                    <option value="">Kategori seçin</option>
                    {DICTIONARY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <Select
                    id="status"
                    value={form.status}
                    onChange={(e) =>
                      updateForm("status", e.target.value as DictionaryStatus)
                    }
                    className="rounded-xl"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {dictionaryStatusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </div>
                <SchedulePublishField
                  value={form.scheduledAt}
                  onChange={(value) => updateForm("scheduledAt", value)}
                  id="dictionary-scheduled-at"
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
              disabled={saving}
            >
              <Save className="size-4" />
              {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
            </Button>

            <SeoPanel
              seo={form.seo}
              onSeoChange={(key, value) =>
                setForm((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, [key]: value },
                }))
              }
              preview={{
                title: form.title || "Terim başlığı",
                slug: termSlug,
                pathPrefix: "/sozluk",
                fallbackDescription: form.shortDescription,
              }}
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
