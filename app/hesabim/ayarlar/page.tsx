import type { Metadata } from "next";

import { AccountLayout } from "@/components/account/account-layout";
import { AccountSettingsPanel } from "@/components/account/account-settings-panel";
import { requireAccountUser } from "@/lib/account/require-user";
import { getAccountProfileData } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Ayarlar",
};

export default async function AccountSettingsPage() {
  const user = await requireAccountUser("/hesabim/ayarlar");
  const profile = await getAccountProfileData(user.id);

  return (
    <AccountLayout
      user={user}
      title="Ayarlar"
      description="Hesap bilgileriniz ve oturum yönetimi."
    >
      <AccountSettingsPanel
        user={user}
        memberSince={profile?.createdAt ?? "-"}
      />
    </AccountLayout>
  );
}
