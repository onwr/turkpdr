"use client";

import { useCallback, useEffect, useState } from "react";

type EditorOption = {
  id: string;
  name: string;
  role: string;
};

type AssignedEditorSelectProps = {
  contentId: string;
  value: string | null;
  disabled?: boolean;
  onAssigned?: () => void;
  onError?: (message: string) => void;
};

export function AssignedEditorSelect({
  contentId,
  value,
  disabled = false,
  onAssigned,
  onError,
}: AssignedEditorSelectProps) {
  const [editors, setEditors] = useState<EditorOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/editors")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setEditors(data?.editors ?? []))
      .catch(() => setEditors([]));
  }, []);

  const handleChange = useCallback(
    async (editorId: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/contents/${contentId}/assign`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            editorId: editorId || null,
          }),
        });
        const data = (await res.json()) as { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? "Editör ataması yapılamadı.");
        }

        onAssigned?.();
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : "Editör ataması yapılamadı."
        );
      } finally {
        setLoading(false);
      }
    },
    [contentId, onAssigned, onError]
  );

  return (
    <select
      value={value ?? ""}
      disabled={disabled || loading}
      onChange={(event) => void handleChange(event.target.value)}
      className="h-8 max-w-[160px] rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
      aria-label="Atanan editör"
    >
      <option value="">Atanmadı</option>
      {editors.map((editor) => (
        <option key={editor.id} value={editor.id}>
          {editor.name}
        </option>
      ))}
    </select>
  );
}
