import { FileEditorPage } from "@/components/admin/files/file-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminNewFilePage() {
  await requireAdminAccess();
  return <FileEditorPage />;
}
