import { CommentsListPage } from "@/components/admin/comments/comments-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  await requireAdminAccess();
  return <CommentsListPage />;
}
