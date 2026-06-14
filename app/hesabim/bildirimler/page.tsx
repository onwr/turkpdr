import type { Metadata } from "next";

import { AccountLayout } from "@/components/account/account-layout";
import { AccountNotificationsPage } from "@/components/account/account-notifications-page";
import { requireAccountUser } from "@/lib/account/require-user";

export const metadata: Metadata = {
  title: "Bildirimlerim",
  description: "Hesabınızla ilgili bildirimleri görüntüleyin.",
};

export default async function AccountNotificationsRoutePage() {
  const user = await requireAccountUser("/hesabim/bildirimler");

  return (
    <AccountLayout
      user={user}
      title="Bildirimlerim"
      description="İçerik, mesaj ve sistem bildirimlerinizi yönetin."
    >
      <AccountNotificationsPage />
    </AccountLayout>
  );
}
