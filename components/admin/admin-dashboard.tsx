import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { DashboardNotifications } from "@/components/admin/dashboard-notifications";
import { LatestActivitiesList } from "@/components/admin/latest-activities-list";
import { LatestCommentsList } from "@/components/admin/latest-comments-list";
import { LatestContentList } from "@/components/admin/latest-content-list";
import { LatestFilesList } from "@/components/admin/latest-files-list";
import { LatestMembersList } from "@/components/admin/latest-members-list";
import { PendingContentTable } from "@/components/admin/pending-content-table";
import type { AdminDashboardData } from "@/types/admin";
import type { UserRole } from "@prisma/client";

type AdminDashboardProps = {
  data: AdminDashboardData;
  currentUserId: string;
  userRole: UserRole;
};

export function AdminDashboard({
  data,
  currentUserId,
  userRole,
}: AdminDashboardProps) {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {data.stats.map((stat) => (
            <AdminStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <PendingContentTable
          items={data.pendingItems}
          currentUserId={currentUserId}
          userRole={userRole}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <LatestContentList items={data.latestContents} />
          <AdminQuickActions />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <LatestMembersList members={data.latestMembers} />
          <LatestCommentsList comments={data.latestComments} />
          <LatestFilesList files={data.latestFiles} />
        </div>

        <LatestActivitiesList activities={data.latestActivities} />

        <DashboardNotifications notifications={data.notifications} />
      </div>
    </AdminLayout>
  );
}
