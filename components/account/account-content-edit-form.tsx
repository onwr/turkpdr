"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Loader2, RotateCcw, Save, Send } from "lucide-react";

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

type AccountContentEditFormProps = {
  contentId: string;
  categories: CategoryOption[];
};

type LoadedContent = {
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  categoryId: string;
  tags: string[];
  status: string;
  reviewNote: string | null;
};

export function AccountContentEditForm({
  contentId,
  categories,
}: AccountContentEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [initialContent, setInitialContent] = useState<string | undefined>();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/account/contents/${contentId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "İçerik yüklenemedi.");
        }

        const content = data.content as LoadedContent;
        setTitle(content.title);
        setSummary(content.summary ?? "");
        setCategoryId(content.categoryId ?? "");
        setCoverImage(content.coverImage);
        setTags(content.tags ?? []);
        setReviewNote(content.reviewNote);
        setInitialContent(content.content ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "İçerik yüklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [contentId]);

  const handleEditorReady = useCallback((ed: Editor) => {
    setEditor(ed);
  }, []);

  async function saveContent(): Promise<void> {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/account/contents/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim() || null,
          content: editor?.getHTML() ?? "",
          coverImage,
          categoryId: categoryId || null,
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İçerik kaydedilemedi.");
      }
      setSuccess("Değişiklikler kaydedildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İçerik kaydedilemedi.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleResubmit() {
    setResubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await saveContent();
      const res = await fetch(
        `/api/account/contents/${contentId}/resubmit`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İçerik tekrar gönderilemedi.");
      }
      router.push("/hesabim/paylasimlar");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "İçerik tekrar gönderilemedi."
      );
    } finally {
      setResubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        İçerik yükleniyor...
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void saveContent();
      }}
    >
      {reviewNote ? (
        <Card className="border-orange-200 bg-orange-50/60">
          <CardHeader>
            <CardTitle className="text-base text-orange-900">
              Editör Notu
            </CardTitle>
            <CardDescription className="text-orange-800">
              Aşağıdaki geri bildirime göre düzenleme yapıp tekrar onaya
              gönderebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-orange-950">
              {reviewNote}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>İçerik Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Özet</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="rounded-xl"
              rows={3}
            />
          </div>
          <CategorySelect
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
          <CoverImageUpload
            value={coverImage}
            onChange={setCoverImage}
            uploadUrl={ACCOUNT_UPLOAD_URL}
          />
          <TagsPanel tags={tags} onChange={setTags} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İçerik Metni</CardTitle>
        </CardHeader>
        <CardContent>
          {initialContent !== undefined ? (
            <TiptapEditor
              initialContent={initialContent}
              onEditorReady={handleEditorReady}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          className="rounded-xl bg-brand-blue"
          disabled={saving || resubmitting}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Kaydet
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={saving || resubmitting}
          onClick={() => void handleResubmit()}
        >
          {resubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Tekrar Onaya Gönder
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="rounded-xl"
          onClick={() => router.push("/hesabim/paylasimlar")}
        >
          <RotateCcw className="size-4" />
          Listeye Dön
        </Button>
      </div>
    </form>
  );
}
