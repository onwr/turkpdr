import type { AppContentStatus } from "@/types/content";

export const STATUSES_REQUIRING_REVIEW_NOTE: AppContentStatus[] = [
  "REJECTED",
  "REVISION_REQUESTED",
];

export const AUTHOR_EDITABLE_STATUSES: AppContentStatus[] = [
  "DRAFT",
  "REJECTED",
  "REVISION_REQUESTED",
];

export const AUTHOR_RESUBMIT_STATUSES: AppContentStatus[] = [
  "REJECTED",
  "REVISION_REQUESTED",
];

export function requiresReviewNote(status: AppContentStatus): boolean {
  return STATUSES_REQUIRING_REVIEW_NOTE.includes(status);
}

export function validateReviewNote(
  status: AppContentStatus,
  note?: string | null
): string | null {
  if (!requiresReviewNote(status)) {
    return null;
  }

  if (!note?.trim()) {
    return status === "REVISION_REQUESTED"
      ? "Revizyon isteği için not yazmanız zorunludur."
      : "Reddetme işlemi için not yazmanız zorunludur.";
  }

  if (note.trim().length > 2000) {
    return "Not en fazla 2000 karakter olabilir.";
  }

  return null;
}

export function canAuthorEditContent(status: AppContentStatus): boolean {
  return AUTHOR_EDITABLE_STATUSES.includes(status);
}

export function canAuthorResubmit(status: AppContentStatus): boolean {
  return AUTHOR_RESUBMIT_STATUSES.includes(status);
}