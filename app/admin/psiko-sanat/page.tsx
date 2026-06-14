import { PsikoSanatListPage } from "@/components/admin/psiko-sanat/psiko-sanat-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPsikoSanatPage() {
  const user = await requireAdminAccess();
  return <PsikoSanatListPage userRole={user.role} />;
}
