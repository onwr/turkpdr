import { TestEditorPage } from "@/components/admin/tests/test-editor-page";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TestEditorPage testId={id} />;
}
