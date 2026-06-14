import { FileEditorPage } from "@/components/admin/files/file-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditFilePage({ params }: PageProps) {
  await requireAdminAccess();
  const { id } = await params;
  return <FileEditorPage fileId={id} />;
}
