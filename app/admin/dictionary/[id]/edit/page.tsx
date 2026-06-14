import { DictionaryEditorPage } from "@/components/admin/dictionary/dictionary-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminDictionaryEditPage({ params }: PageProps) {
  await requireAdminAccess();
  const { id } = await params;
  return <DictionaryEditorPage termId={id} />;
}
