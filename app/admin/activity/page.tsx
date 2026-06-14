import { ActivityListPage } from "@/components/admin/activity/activity-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  await requireAdminAccess();
  return <ActivityListPage />;
}
