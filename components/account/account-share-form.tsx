"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Loader2, Send } from "lucide-react";

import { CategorySelect } from "@/components/admin/editor/category-select";
import { CoverImageUpload } from "@/components/admin/editor/cover-image-upload";
import { TagsPanel } from "@/components/admin/editor/tags-panel";
import { TiptapEditor } from "@/components/admin/editor/tiptap-editor";
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

const ACCOUNT_UPLOAD_URL = "/api/account/upload";

type CategoryOption = {
  id: string;
  name: string;
};

type AccountShareFormProps = {
  categories: CategoryOption[];
};

export function AccountShareForm({ categories }: AccountShareFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEditorReady = useCallback((ed: Editor) => {
    setEditor(ed);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const contentHtml = editor?.getHTML() ?? "";

    if (!title.trim()) {
      setError("Başlık alanı zorunludur.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/account/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim() || null,
          content: contentHtml,
          coverImage,
          categoryId: categoryId || null,
          tags,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Paylaşım gönderilemedi.");
      }

      setSuccess("Paylaşımınız onay için gönderildi.");
      router.push("/hesabim/paylasimlar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
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
          <CardTitle>Başlık ve Özet</CardTitle>
          <CardDescription>
            Paylaşımınız editör onayından sonra yayınlanır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Makale başlığınız"
              required
              className="rounded-xl text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Özet</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Kısa bir özet yazın..."
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <CategorySelect
        value={categoryId}
        onChange={setCategoryId}
        categoryType="ARTICLE"
        categories={categories}
      />

      <CoverImageUpload
        value={coverImage}
        onChange={setCoverImage}
        uploadUrl={ACCOUNT_UPLOAD_URL}
      />

      <div className="space-y-2">
        <Label>İçerik *</Label>
        <TiptapEditor
          onEditorReady={handleEditorReady}
          uploadUrl={ACCOUNT_UPLOAD_URL}
        />
        <p className="text-xs text-muted-foreground">
          Kalın, italik, başlık, liste, alıntı, link, görsel, video ve PDF
          ekleyebilirsiniz. Slash (/) menüsünü de kullanabilirsiniz.
        </p>
      </div>

      <TagsPanel tags={tags} onChange={setTags} />

      <div className="flex flex-wrap gap-3">
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
      </div>
    </form>
  );
}
