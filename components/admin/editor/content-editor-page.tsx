"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import type { ContentStatus, ContentType } from "@prisma/client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { CategorySelect } from "@/components/admin/editor/category-select";
import { ContentTitleInput } from "@/components/admin/editor/content-title-input";
import { ContentTypeSelect } from "@/components/admin/editor/content-type-select";
import { CoverImageUpload } from "@/components/admin/editor/cover-image-upload";
import { EditorHeader } from "@/components/admin/editor/editor-header";
import { MediaInsertPanel } from "@/components/admin/editor/media-insert-panel";
import { PublishPanel } from "@/components/admin/editor/publish-panel";
import { SeoPanel } from "@/components/admin/editor/seo-panel";
import { TagsPanel } from "@/components/admin/editor/tags-panel";
import { TiptapEditor } from "@/components/admin/editor/tiptap-editor";
import {
  defaultContentFormState,
  type ContentFormState,
} from "@/types/content";
import { seoFieldsFromRecord } from "@/types/seo";
import {
  getContentSeoPreviewPath,
} from "@/lib/seo/content-paths";
import { formatScheduledAtForInput } from "@/lib/scheduling/utils";

type ContentEditorPageProps = {
  params?: Promise<{ id: string }>;
  fixedType?: ContentType;
  listPath?: string;
  backLabel?: string;
  pageTitle?: string;
  breadcrumbLabel?: string;
};

export function ContentEditorPage({
  params,
  fixedType,
  listPath = "/admin/contents",
  backLabel = "İçerikler",
  pageTitle = "İçerik Editörü",
  breadcrumbLabel = "İçerikler",
}: ContentEditorPageProps) {
  const router = useRouter();
  const [contentId, setContentId] = useState<string | null>(null);
  const [form, setForm] = useState<ContentFormState>({
    ...defaultContentFormState,
    type: fixedType ?? defaultContentFormState.type,
  });
  const [contentSlug, setContentSlug] = useState<string | undefined>();
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [lastSaved, setLastSaved] = useState<string | undefined>();
  const [loading, setLoading] = useState(!!params);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!contentId;

  useEffect(() => {
    if (!params) return;

    void (async () => {
      const { id } = await params;
      setContentId(id);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/contents/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "İçerik yüklenemedi.");
        }

        const content = data.content;

        if (fixedType && content.type !== fixedType) {
          throw new Error(
            `Bu kayıt ${breadcrumbLabel} modülünde düzenlenemez.`
          );
        }

        setForm({
          title: content.title,
          summary: content.summary ?? "",
          categoryId: content.categoryId ?? "",
          type: content.type as ContentType,
          coverImage: content.coverImage,
          tags: content.tags.map((t: { name: string }) => t.name),
          status: content.status as ContentStatus,
          featured: content.featured,
          scheduledAt: formatScheduledAtForInput(content.scheduledAt),
          seo: seoFieldsFromRecord(content),
        });
        setContentSlug(content.slug);
        setEditorContent(content.content ?? "<p></p>");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params, fixedType, breadcrumbLabel]);

  const updateForm = useCallback(
    <K extends keyof ContentFormState>(key: K, value: ContentFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const saveContent = async (status: ContentStatus) => {
    if (!form.title.trim()) {
      window.alert("Başlık alanı zorunludur.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      content: editor?.getHTML() ?? null,
      coverImage: form.coverImage,
      type: fixedType ?? form.type,
      status,
      featured: form.featured,
      categoryId: form.categoryId || null,
      tags: form.tags,
      scheduledAt: form.scheduledAt || null,
      ...form.seo,
    };

    try {
      const url = isEditMode
        ? `/api/admin/contents/${contentId}`
        : "/api/admin/contents";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kayıt işlemi başarısız.");
      }

      const now = new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSaved(`${now} kaydedildi`);
      router.push(listPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bir hata oluştu.";
      setError(message);
      window.alert(message);
    } finally {
      setSaving(false);
    }
  };

  const updateSeo = useCallback(
    <K extends keyof ContentFormState["seo"]>(
      key: K,
      value: ContentFormState["seo"][K]
    ) => {
      setForm((prev) => ({
        ...prev,
        seo: { ...prev.seo, [key]: value },
      }));
    },
    []
  );

  const previewType = fixedType ?? form.type;
  const previewPath = getContentSeoPreviewPath(previewType);

  const handleSaveDraft = () => void saveContent("DRAFT");
  const handlePublish = () => void saveContent("PUBLISHED");

  const handlePreview = () => {
    window.alert("Önizleme modu yakında aktif olacak.");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          İçerik yükleniyor...
        </div>
      </AdminLayout>
    );
  }

  if (error && isEditMode && !form.title) {
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
      <EditorHeader
        status={form.status}
        lastSaved={lastSaved}
        mode={isEditMode ? "edit" : "create"}
        backHref={listPath}
        backLabel={backLabel}
        pageTitle={pageTitle}
        breadcrumbLabel={breadcrumbLabel}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4 min-w-0">
          <ContentTitleInput
            value={form.title}
            onChange={(value) => updateForm("title", value)}
          />
          {!fixedType && (
            <ContentTypeSelect
              value={form.type}
              onChange={(value) => updateForm("type", value)}
            />
          )}
          <CategorySelect
            value={form.categoryId}
            onChange={(value) => updateForm("categoryId", value)}
            categoryType={fixedType}
          />
          <CoverImageUpload
            value={form.coverImage}
            onChange={(value) => updateForm("coverImage", value)}
          />
          {(!isEditMode || editorContent !== null) && (
            <TiptapEditor
              key={contentId ?? "new"}
              onEditorReady={setEditor}
              initialContent={editorContent ?? undefined}
            />
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <PublishPanel
            status={form.status}
            featured={form.featured}
            scheduledAt={form.scheduledAt}
            saving={saving}
            onStatusChange={(status) => updateForm("status", status)}
            onFeaturedChange={(featured) => updateForm("featured", featured)}
            onScheduledAtChange={(value) => updateForm("scheduledAt", value)}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            onPreview={handlePreview}
          />
          <SeoPanel
            showSummary
            summary={form.summary}
            onSummaryChange={(value) => updateForm("summary", value)}
            seo={form.seo}
            onSeoChange={updateSeo}
            preview={{
              title: form.title || "İçerik başlığı",
              slug: contentSlug,
              pathPrefix: previewPath,
              fallbackDescription: form.summary,
              defaultImage: form.coverImage,
            }}
            onUseDefaultImage={
              form.coverImage
                ? () => updateSeo("ogImage", form.coverImage ?? "")
                : undefined
            }
          />
          <TagsPanel
            tags={form.tags}
            onChange={(tags) => updateForm("tags", tags)}
          />
          <MediaInsertPanel editor={editor} />
        </aside>
      </div>
    </AdminLayout>
  );
}
