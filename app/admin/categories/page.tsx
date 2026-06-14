import { CategoriesListPage } from "@/components/admin/categories/categories-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await requireAdminAccess();
  return <CategoriesListPage userRole={user.role} />;
}
