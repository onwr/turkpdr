import type { Metadata } from "next";

import { AccountDashboard } from "@/components/account/account-dashboard";
import { AccountLayout } from "@/components/account/account-layout";
import { requireAccountUser } from "@/lib/account/require-user";
import { getAccountSummary } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Hesabım",
  description: "TürkPDR kullanıcı paneli.",
};

export default async function HesabimPage() {
  const user = await requireAccountUser("/hesabim");
  const summary = await getAccountSummary(user.id);

  return (
    <AccountLayout
      user={user}
      title={`Merhaba, ${user.name}`}
      description="Paylaşımlarınızı, test sonuçlarınızı ve profil bilgilerinizi tek yerden yönetin."
    >
      <AccountDashboard summary={summary} />
    </AccountLayout>
  );
}
