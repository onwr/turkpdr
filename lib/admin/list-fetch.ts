import { ADMIN_LIST_PAGE_SIZE } from "@/lib/admin/list-constants";

export function appendListPagination(
  params: URLSearchParams,
  page: number,
  limit = ADMIN_LIST_PAGE_SIZE
): void {
  params.set("page", String(page));
  params.set("limit", String(limit));
}

export type ListPaginationMeta = {
  total: number;
  page: number;
  totalPages: number;
};
