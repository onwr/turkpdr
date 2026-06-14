import { ContentEditorPage } from "@/components/admin/editor/content-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPsikoSanatPage({ params }: PageProps) {
  await requireAdminAccess();

  return (
    <ContentEditorPage
      params={params}
      fixedType="PSIKO_SANAT"
      listPath="/admin/psiko-sanat"
      backLabel="Psiko Sanat"
      breadcrumbLabel="Psiko Sanat"
      pageTitle="Psiko Sanat İçeriği Düzenle"
    />
  );
}
