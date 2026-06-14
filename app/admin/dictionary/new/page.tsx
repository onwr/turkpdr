import { DictionaryEditorPage } from "@/components/admin/dictionary/dictionary-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDictionaryNewPage() {
  await requireAdminAccess();
  return <DictionaryEditorPage />;
}
