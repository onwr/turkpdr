import { SettingsPage } from "@/components/admin/settings/settings-page";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);
  return <SettingsPage />;
}
