"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { ImageUploadField } from "@/components/admin/settings/image-upload-field";
import { TagListInput } from "@/components/profile/tag-list-input";
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
import type { AccountProfileData } from "@/types/account";

type AccountProfileFormProps = {
  initialData: AccountProfileData;
};

export function AccountProfileForm({ initialData }: AccountProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialData.name,
    title: initialData.title,
    bio: initialData.bio,
    avatar: initialData.avatar,
    coverImage: initialData.coverImage,
    email: initialData.email,
    phone: initialData.phone,
    city: initialData.city,
    website: initialData.website,
    workAreas: initialData.workAreas,
    expertiseAreas: initialData.expertiseAreas,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          bio: form.bio,
          avatar: form.avatar,
          coverImage: form.coverImage || null,
          phone: form.phone,
          city: form.city,
          website: form.website,
          workAreas: form.workAreas,
          expertiseAreas: form.expertiseAreas,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Profil güncellenemedi.");
      }

      setSuccess("Profiliniz başarıyla güncellendi.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Görünüm</CardTitle>
          <CardDescription>Banner ve profil fotoğrafınız.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ImageUploadField
            label="Profil Banner"
            value={form.coverImage}
            onChange={(coverImage) =>
              setForm((prev) => ({ ...prev, coverImage }))
            }
            uploadUrl="/api/profile/avatar"
            previewAspect="wide"
            hint="JPG, PNG veya WEBP · Maks. 5MB"
          />
          <ImageUploadField
            label="Profil Fotoğrafı"
            value={form.avatar}
            onChange={(avatar) => setForm((prev) => ({ ...prev, avatar }))}
            uploadUrl="/api/profile/avatar"
            previewAspect="square"
            previewClassName="max-w-[160px]"
            hint="JPG, PNG veya WEBP · Maks. 5MB"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Kişisel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              value={form.email}
              disabled
              className="rounded-xl bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Ünvan / Meslek</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Hakkımda</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={6}
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Uzmanlık ve İletişim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <TagListInput
            id="workAreas"
            label="Çalışma Alanları"
            value={form.workAreas}
            onChange={(workAreas) =>
              setForm((prev) => ({ ...prev, workAreas }))
            }
          />
          <TagListInput
            id="expertiseAreas"
            label="Uzmanlık Alanları"
            value={form.expertiseAreas}
            onChange={(expertiseAreas) =>
              setForm((prev) => ({ ...prev, expertiseAreas }))
            }
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Web Sitesi</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, website: e.target.value }))
              }
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="rounded-xl bg-brand-blue"
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Kaydet
      </Button>
    </form>
  );
}
