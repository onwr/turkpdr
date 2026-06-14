"use client";

import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

export function AdminPagination({
  page,
  totalPages,
  total,
  loading = false,
  onPageChange,
}: AdminPaginationProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-muted-foreground">
        Toplam {total} kayıt · Sayfa {page} / {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Önceki
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Sonraki
        </Button>
      </div>
    </div>
  );
}
