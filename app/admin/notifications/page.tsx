import { NotificationsListPage } from "@/components/admin/notifications/notifications-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  await requireAdminAccess();
  return <NotificationsListPage />;
}
