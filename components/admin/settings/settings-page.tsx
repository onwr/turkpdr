"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  ImageIcon,
  Mail,
  Save,
  Search,
  Settings,
  Share2,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { ImageUploadField } from "@/components/admin/settings/image-upload-field";
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
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSiteSettingsFormState,
  type SiteSettingsFormState,
} from "@/types/settings";

function toFormState(
  settings: Record<string, string | null | undefined>
): SiteSettingsFormState {
  return {
    siteName: settings.siteName ?? defaultSiteSettingsFormState.siteName,
    logoUrl: settings.logoUrl ?? "",
    faviconUrl: settings.faviconUrl ?? "",
    metaTitle: settings.metaTitle ?? "",
    metaDescription: settings.metaDescription ?? "",
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    twitterUrl: settings.twitterUrl ?? "",
    linkedinUrl: settings.linkedinUrl ?? "",
    youtubeUrl: settings.youtubeUrl ?? "",
    footerText: settings.footerText ?? "",
    googleAnalyticsId: settings.googleAnalyticsId ?? "",
    googleSearchConsoleCode: settings.googleSearchConsoleCode ?? "",
    googleAdsensePublisherId: settings.googleAdsensePublisherId ?? "",
  };
}

export function SettingsPage() {
  const [form, setForm] = useState<SiteSettingsFormState>(
    defaultSiteSettingsFormState
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ayarlar yüklenemedi.");
        setForm(toFormState(data.settings));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateForm = <K extends keyof SiteSettingsFormState>(
    key: K,
    value: SiteSettingsFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.siteName.trim()) {
      setError("Site adı zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      siteName: form.siteName.trim(),
      logoUrl: form.logoUrl.trim() || null,
      faviconUrl: form.faviconUrl.trim() || null,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      contactEmail: form.contactEmail.trim() || null,
      contactPhone: form.contactPhone.trim() || null,
      instagramUrl: form.instagramUrl.trim() || null,
      twitterUrl: form.twitterUrl.trim() || null,
      linkedinUrl: form.linkedinUrl.trim() || null,
      youtubeUrl: form.youtubeUrl.trim() || null,
      footerText: form.footerText.trim() || null,
      googleAnalyticsId: form.googleAnalyticsId.trim() || null,
      googleSearchConsoleCode: form.googleSearchConsoleCode.trim() || null,
      googleAdsensePublisherId: form.googleAdsensePublisherId.trim() || null,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Kayıt işlemi başarısız.");

      setForm(toFormState(data.settings));
      setSuccess(data.message || "Site ayarları güncellendi.");
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
          Ayarlar yükleniyor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-brand-navy sm:text-2xl">
          Site Ayarları
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Genel site bilgilerini, SEO ve iletişim ayarlarını yönetin.
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

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-4 text-brand-blue" />
              Genel Ayarlar
            </CardTitle>
            <CardDescription>Site adı ve temel bilgiler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Adı *</Label>
              <Input
                id="siteName"
                value={form.siteName}
                onChange={(e) => updateForm("siteName", e.target.value)}
                placeholder="TürkPDR"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Metni</Label>
              <Textarea
                id="footerText"
                value={form.footerText}
                onChange={(e) => updateForm("footerText", e.target.value)}
                placeholder="Site açıklama metni"
                className="rounded-xl"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-4 text-brand-blue" />
              Logo & Favicon
            </CardTitle>
            <CardDescription>Marka görsellerini yükleyin</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <ImageUploadField
              label="Logo"
              value={form.logoUrl}
              onChange={(value) => updateForm("logoUrl", value)}
              previewAspect="wide"
            />
            <ImageUploadField
              label="Favicon"
              value={form.faviconUrl}
              onChange={(value) => updateForm("faviconUrl", value)}
              hint="Boş bırakılırsa logo favicon olarak kullanılır · PNG veya ICO · Maks. 5MB"
              previewAspect="square"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="size-4 text-brand-blue" />
              SEO Ayarları
            </CardTitle>
            <CardDescription>Arama motoru ve meta bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Başlık</Label>
              <Input
                id="metaTitle"
                value={form.metaTitle}
                onChange={(e) => updateForm("metaTitle", e.target.value)}
                placeholder="Site meta başlığı"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Textarea
                id="metaDescription"
                value={form.metaDescription}
                onChange={(e) => updateForm("metaDescription", e.target.value)}
                placeholder="Site meta açıklaması"
                className="rounded-xl"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-4 text-brand-blue" />
              İletişim
            </CardTitle>
            <CardDescription>İletişim bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-posta</Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateForm("contactEmail", e.target.value)}
                placeholder="info@turkpdr.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telefon</Label>
              <Input
                id="contactPhone"
                value={form.contactPhone}
                onChange={(e) => updateForm("contactPhone", e.target.value)}
                placeholder="+90 555 000 00 00"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="size-4 text-brand-blue" />
              Sosyal Medya
            </CardTitle>
            <CardDescription>Sosyal medya profil bağlantıları</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                value={form.instagramUrl}
                onChange={(e) => updateForm("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/turkpdr"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter / X</Label>
              <Input
                id="twitterUrl"
                value={form.twitterUrl}
                onChange={(e) => updateForm("twitterUrl", e.target.value)}
                placeholder="https://twitter.com/turkpdr"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                value={form.linkedinUrl}
                onChange={(e) => updateForm("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/company/turkpdr"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube</Label>
              <Input
                id="youtubeUrl"
                value={form.youtubeUrl}
                onChange={(e) => updateForm("youtubeUrl", e.target.value)}
                placeholder="https://youtube.com/@turkpdr"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-brand-blue" />
              Tracking Kodları
            </CardTitle>
            <CardDescription>Analitik ve doğrulama kodları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={form.googleAnalyticsId}
                onChange={(e) => updateForm("googleAnalyticsId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleSearchConsoleCode">
                Google Search Console Doğrulama Kodu
              </Label>
              <Input
                id="googleSearchConsoleCode"
                value={form.googleSearchConsoleCode}
                onChange={(e) =>
                  updateForm("googleSearchConsoleCode", e.target.value)
                }
                placeholder="google-site-verification kodu"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-brand-blue" />
              Reklamlar
            </CardTitle>
            <CardDescription>
              Google AdSense entegrasyonu — Auto Ads ile reklamlar sayfaya
              otomatik yerleştirilir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleAdsensePublisherId">
                Google AdSense Yayıncı ID
              </Label>
              <Input
                id="googleAdsensePublisherId"
                value={form.googleAdsensePublisherId}
                onChange={(e) =>
                  updateForm("googleAdsensePublisherId", e.target.value)
                }
                placeholder="pub-XXXXXXXXXXXXXXXX"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
            disabled={saving}
          >
            <Save className="size-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
