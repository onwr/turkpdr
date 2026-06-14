import { ContentEditorPage } from "@/components/admin/editor/content-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminNewNewsPage() {
  await requireAdminAccess();

  return (
    <ContentEditorPage
      fixedType="NEWS"
      listPath="/admin/news"
      backLabel="Haberler"
      breadcrumbLabel="Haberler"
      pageTitle="Yeni Haber"
    />
  );
}
