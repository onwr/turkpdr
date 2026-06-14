import { NewsListPage } from "@/components/admin/news/news-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const user = await requireAdminAccess();
  return <NewsListPage userRole={user.role} />;
}
