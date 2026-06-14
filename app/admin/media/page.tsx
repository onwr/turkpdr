import { MediaLibraryPage } from "@/components/admin/media/media-library-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const user = await requireAdminAccess();
  return <MediaLibraryPage userRole={user.role} />;
}
