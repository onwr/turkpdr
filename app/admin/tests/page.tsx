import { TestsListPage } from "@/components/admin/tests/tests-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminTestsPage() {
  const user = await requireAdminAccess();
  return <TestsListPage userRole={user.role} />;
}
