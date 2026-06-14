import { AdminLayout } from "@/components/admin/admin-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

type AdminComingSoonPageProps = {
  title: string;
  description: string;
  icon?: "users" | "video" | "inbox" | "file";
};

export function AdminComingSoonPage({
  title,
  description,
  icon = "inbox",
}: AdminComingSoonPageProps) {
  return (
    <AdminLayout>
      <PageHeader title={title} description={description} />
      <EmptyState
        title="Yakında Aktif"
        description="Bu modül geliştirme aşamasındadır. Kısa süre içinde kullanıma sunulacaktır."
        icon={icon}
        action={{ label: "Panele Dön", href: "/admin" }}
      />
    </AdminLayout>
  );
}
