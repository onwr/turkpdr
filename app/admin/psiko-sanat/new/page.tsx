import { ContentEditorPage } from "@/components/admin/editor/content-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminNewPsikoSanatPage() {
  await requireAdminAccess();

  return (
    <ContentEditorPage
      fixedType="PSIKO_SANAT"
      listPath="/admin/psiko-sanat"
      backLabel="Psiko Sanat"
      breadcrumbLabel="Psiko Sanat"
      pageTitle="Yeni Psiko Sanat İçeriği"
    />
  );
}
