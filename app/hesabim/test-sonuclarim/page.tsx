import type { Metadata } from "next";

import { AccountLayout } from "@/components/account/account-layout";
import { AccountTestResults } from "@/components/account/account-test-results";
import { requireAccountUser } from "@/lib/account/require-user";
import { getAccountTestResults } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Test Sonuçlarım",
};

export default async function AccountTestResultsPage() {
  const user = await requireAccountUser("/hesabim/test-sonuclarim");
  const results = await getAccountTestResults(user.id);

  return (
    <AccountLayout
      user={user}
      title="Test Sonuçlarım"
      description="Çözdüğünüz testlerin sonuç geçmişi."
    >
      <AccountTestResults items={results} />
    </AccountLayout>
  );
}
