import { FilesListPage } from "@/components/admin/files/files-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminFilesPage() {
  const user = await requireAdminAccess();
  return <FilesListPage userRole={user.role} />;
}
