import { ContentEditorPage } from "@/components/admin/editor/content-editor-page";

export default function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ContentEditorPage params={params} />;
}
