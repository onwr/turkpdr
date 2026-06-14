import { getAdminDashboardData } from "@/lib/queries/admin-dashboard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminAccess();
  const data = await getAdminDashboardData();
  return (
    <AdminDashboard
      data={data}
      currentUserId={user.id}
      userRole={user.role}
    />
  );
}
