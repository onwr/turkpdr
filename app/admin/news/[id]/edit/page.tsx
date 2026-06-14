import { ContentEditorPage } from "@/components/admin/editor/content-editor-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditNewsPage({ params }: PageProps) {
  await requireAdminAccess();

  return (
    <ContentEditorPage
      params={params}
      fixedType="NEWS"
      listPath="/admin/news"
      backLabel="Haberler"
      breadcrumbLabel="Haberler"
      pageTitle="Haber Düzenle"
    />
  );
}
