import { TrashPage } from "@/components/admin/trash/trash-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminTrashPage() {
  const user = await requireAdminAccess();

  return <TrashPage userRole={user.role} />;
}
