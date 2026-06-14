"use client";

import { useState } from "react";
import type { AppContentStatus } from "@/types/content";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContentReviewNoteDialogProps = {
  open: boolean;
  title: string;
  status: Extract<AppContentStatus, "REJECTED" | "REVISION_REQUESTED">;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reviewNote: string) => void | Promise<void>;
};

export function ContentReviewNoteDialog({
  open,
  title,
  status,
  loading = false,
  onClose,
  onSubmit,
}: ContentReviewNoteDialogProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isRevision = status === "REVISION_REQUESTED";

  function handleClose() {
    setNote("");
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!note.trim()) {
      setError(
        isRevision
          ? "Revizyon isteği için not yazmanız zorunludur."
          : "Reddetme işlemi için not yazmanız zorunludur."
      );
      return;
    }

    setError(null);
    await onSubmit(note.trim());
    setNote("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRevision ? "Revizyon İste" : "İçeriği Reddet"}
          </DialogTitle>
          <DialogDescription>
            {isRevision
              ? `"${title}" için yazarın görmesi amacıyla revizyon notu yazın.`
              : `"${title}" içeriğini reddetmek için yazarın göreceği bir not yazın.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="review-note">Editör Notu</Label>
          <Textarea
            id="review-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              isRevision
                ? "Hangi düzenlemeleri yapması gerektiğini yazın..."
                : "Reddetme gerekçesini yazın..."
            }
            rows={5}
            className="rounded-xl"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={handleClose}
            disabled={loading}
          >
            Vazgeç
          </Button>
          <Button
            className="rounded-xl"
            variant={isRevision ? "default" : "destructive"}
            onClick={() => void handleSubmit()}
            disabled={loading}
          >
            {loading
              ? "Kaydediliyor..."
              : isRevision
                ? "Revizyon İste"
                : "Reddet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
