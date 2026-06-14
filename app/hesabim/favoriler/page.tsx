import type { Metadata } from "next";

import { AccountFavoritesPanel } from "@/components/account/account-favorites-panel";
import { AccountLayout } from "@/components/account/account-layout";
import { requireAccountUser } from "@/lib/account/require-user";
import { getAccountFavorites } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Favorilerim",
};

export default async function AccountFavoritesPage() {
  const user = await requireAccountUser("/hesabim/favoriler");
  const favorites = await getAccountFavorites(user.id);

  return (
    <AccountLayout
      user={user}
      title="Favorilerim"
      description="Kaydettiğiniz makale, haber ve diğer içerikler."
    >
      <AccountFavoritesPanel initialItems={favorites} />
    </AccountLayout>
  );
}
