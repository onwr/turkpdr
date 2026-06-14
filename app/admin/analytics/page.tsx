import { AnalyticsDashboardPage } from "@/components/admin/analytics/analytics-dashboard-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdminAccess();
  return <AnalyticsDashboardPage />;
}
