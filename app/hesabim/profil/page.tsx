import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountLayout } from "@/components/account/account-layout";
import { AccountProfileForm } from "@/components/account/account-profile-form";
import { requireAccountUser } from "@/lib/account/require-user";
import { getAccountProfileData } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Profilim",
};

export default async function AccountProfilePage() {
  const user = await requireAccountUser("/hesabim/profil");
  const profile = await getAccountProfileData(user.id);

  if (!profile) notFound();

  return (
    <AccountLayout
      user={user}
      title="Profilim"
      description="Profil bilgilerinizi ve görünüm ayarlarınızı düzenleyin."
    >
      <AccountProfileForm initialData={profile} />
    </AccountLayout>
  );
}
