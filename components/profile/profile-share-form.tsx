"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";

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

type CategoryOption = {
  id: string;
  name: string;
};

type ProfileShareFormProps = {
  userId: string;
  categories: CategoryOption[];
};

export function ProfileShareForm({
  userId,
  categories,
}: ProfileShareFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          content,
          categoryId: categoryId || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Paylaşım gönderilemedi.");
      }

      router.push(`/profil/${userId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href={`/profil/${userId}`}>
              <ArrowLeft className="size-4" />
              Profiline Dön
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Paylaşım Yap
          </h1>
          <p className="text-sm text-muted-foreground">
            Makaleniz editör onayından sonra profilinizde yayınlanır.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)}>
          <Card>
            <CardHeader>
              <CardTitle>Yeni Makale</CardTitle>
              <CardDescription>
                Başlık ve içerik zorunludur. Özet isteğe bağlıdır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="rounded-xl"
                  placeholder="Makale başlığı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Özet</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="rounded-xl"
                  placeholder="Kısa bir özet yazın..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Kategori seçin (isteğe bağlı)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">İçerik *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  required
                  className="rounded-xl"
                  placeholder="Makale içeriğinizi yazın..."
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="submit"
                  className="rounded-xl bg-brand-blue"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Onaya Gönder
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  asChild
                >
                  <Link href={`/profil/${userId}`}>İptal</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
