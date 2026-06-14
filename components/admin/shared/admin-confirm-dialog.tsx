"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export type AdminConfirmState = {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
};

type AdminConfirmDialogProps = {
  state: AdminConfirmState | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AdminConfirmDialog({
  state,
  loading = false,
  onOpenChange,
  onConfirm,
}: AdminConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={state !== null}
      onOpenChange={onOpenChange}
      title={state?.title ?? ""}
      description={state?.description ?? ""}
      confirmLabel={state?.confirmLabel ?? "Onayla"}
      variant={state?.variant ?? "default"}
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
