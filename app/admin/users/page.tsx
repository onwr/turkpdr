import { UsersListPage } from "@/components/admin/users/users-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireAdminAccess();
  return (
    <UsersListPage userRole={user.role} currentUserId={user.id} />
  );
}
