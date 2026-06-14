import { AuthorsListPage } from "@/components/admin/authors/authors-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  await requireAdminAccess();
  return <AuthorsListPage />;
}
