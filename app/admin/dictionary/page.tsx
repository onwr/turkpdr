import { DictionaryListPage } from "@/components/admin/dictionary/dictionary-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDictionaryPage() {
  const user = await requireAdminAccess();
  return <DictionaryListPage userRole={user.role} />;
}
