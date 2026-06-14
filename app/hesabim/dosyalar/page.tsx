import type { Metadata } from "next";

import { AccountFileUpload } from "@/components/account/account-file-upload";
import { AccountFilesList } from "@/components/account/account-files-list";
import { AccountLayout } from "@/components/account/account-layout";
import { requireAccountUser } from "@/lib/account/require-user";
import { getAccountFiles } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Dosyalarım",
};

export default async function AccountFilesPage() {
  const user = await requireAccountUser("/hesabim/dosyalar");
  const files = await getAccountFiles(user.id);

  return (
    <AccountLayout
      user={user}
      title="Dosyalarım"
      description="Yüklediğiniz dosyalar ve onay durumları."
    >
      <div className="space-y-6">
        <AccountFileUpload />
        <AccountFilesList items={files} />
      </div>
    </AccountLayout>
  );
}
