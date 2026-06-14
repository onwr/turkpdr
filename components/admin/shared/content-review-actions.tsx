"use client";

import { useCallback, useState } from "react";
import type { AppContentStatus } from "@/types/content";
import { toPrismaContentStatus } from "@/types/content";
import { Check, MessageSquareWarning, Pencil, X } from "lucide-react";
import Link from "next/link";

import { AssignedEditorSelect } from "@/components/admin/shared/assigned-editor-select";
import { ContentReviewNoteDialog } from "@/components/admin/shared/content-review-note-dialog";
import { Button } from "@/components/ui/button";

type ReviewDialogState = {
  id: string;
  title: string;
  status: Extract<AppContentStatus, "REJECTED" | "REVISION_REQUESTED">;
} | null;

type ContentReviewActionsProps = {
  contentId: string;
  title: string;
  editUrl: string;
  assignedEditorId?: string | null;
  loading?: boolean;
  compact?: boolean;
  showAssign?: boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onLoadingChange?: (id: string | null) => void;
};

export function ContentReviewActions({
  contentId,
  title,
  editUrl,
  assignedEditorId = null,
  loading = false,
  compact = false,
  showAssign = false,
  onSuccess,
  onError,
  onLoadingChange,
}: ContentReviewActionsProps) {
  const [dialog, setDialog] = useState<ReviewDialogState>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const updateStatus = useCallback(
    async (
      status: AppContentStatus,
      reviewNote?: string
    ) => {
      onLoadingChange?.(contentId);
      try {
        const res = await fetch(`/api/admin/contents/${contentId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: toPrismaContentStatus(status),
            reviewNote,
          }),
        });
        const data = (await res.json()) as { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? "İşlem başarısız.");
        }

        setDialog(null);
        onSuccess?.();
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : "İşlem başarısız."
        );
      } finally {
        onLoadingChange?.(null);
      }
    },
    [contentId, onError, onLoadingChange, onSuccess]
  );

  async function handleDialogSubmit(reviewNote: string) {
    if (!dialog) return;
    setDialogLoading(true);
    try {
      await updateStatus(dialog.status, reviewNote);
    } finally {
      setDialogLoading(false);
    }
  }

  const isBusy = loading || dialogLoading;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          size="xs"
          className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => void updateStatus("PUBLISHED")}
          disabled={isBusy}
        >
          <Check className="size-3.5" />
          {!compact ? <span className="hidden xl:inline">Onayla</span> : null}
        </Button>
        <Button
          size="xs"
          variant="destructive"
          className="rounded-lg"
          onClick={() =>
            setDialog({ id: contentId, title, status: "REJECTED" })
          }
          disabled={isBusy}
        >
          <X className="size-3.5" />
          {!compact ? <span className="hidden xl:inline">Reddet</span> : null}
        </Button>
        <Button
          size="xs"
          variant="outline"
          className="rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50"
          onClick={() =>
            setDialog({
              id: contentId,
              title,
              status: "REVISION_REQUESTED",
            })
          }
          disabled={isBusy}
        >
          <MessageSquareWarning className="size-3.5" />
          {!compact ? (
            <span className="hidden xl:inline">Revizyon İste</span>
          ) : null}
        </Button>
        <Button size="xs" variant="outline" className="rounded-lg" asChild>
          <Link href={editUrl}>
            <Pencil className="size-3.5" />
            {!compact ? <span className="hidden xl:inline">Düzenle</span> : null}
          </Link>
        </Button>
        {showAssign ? (
          <AssignedEditorSelect
            contentId={contentId}
            value={assignedEditorId}
            disabled={isBusy}
            onAssigned={onSuccess}
            onError={onError}
          />
        ) : null}
      </div>

      <ContentReviewNoteDialog
        open={dialog !== null}
        title={dialog?.title ?? ""}
        status={dialog?.status ?? "REJECTED"}
        loading={dialogLoading}
        onClose={() => setDialog(null)}
        onSubmit={handleDialogSubmit}
      />
    </>
  );
}
