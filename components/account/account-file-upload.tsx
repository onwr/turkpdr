"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

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
import { PDF_ACCEPT } from "@/types/upload";

export function AccountFileUpload() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Lütfen bir dosya seçin.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("file", file);

      const res = await fetch("/api/account/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Dosya yüklenemedi.");
      }

      setSuccess("Dosyanız onay için gönderildi.");
      setTitle("");
      setDescription("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle>Yeni Dosya Yükle</CardTitle>
        <CardDescription>
          PDF dosyaları onay sonrası yayınlanır. Maks. 20MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-title">Dosya Başlığı *</Label>
            <Input
              id="file-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-description">Açıklama</Label>
            <Textarea
              id="file-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">Dosya (PDF) *</Label>
            <Input
              id="file-input"
              type="file"
              accept={PDF_ACCEPT}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="rounded-xl bg-brand-blue"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Onaya Gönder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
