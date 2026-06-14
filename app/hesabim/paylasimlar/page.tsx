import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { AccountContentList } from "@/components/account/account-content-list";
import { AccountLayout } from "@/components/account/account-layout";
import { Button } from "@/components/ui/button";
import { requireAccountUser } from "@/lib/account/require-user";
import { getAccountContents } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Paylaşımlarım",
};

export default async function AccountPostsPage() {
  const user = await requireAccountUser("/hesabim/paylasimlar");
  const contents = await getAccountContents(user.id);

  return (
    <AccountLayout
      user={user}
      title="Paylaşımlarım"
      description="Oluşturduğunuz tüm içerikler ve onay durumları."
    >
      <div className="mb-4 flex justify-end">
        <Button className="rounded-xl bg-brand-blue" asChild>
          <Link href="/hesabim/paylasimlar/yeni">
            <PlusCircle className="size-4" />
            Yeni Paylaşım
          </Link>
        </Button>
      </div>
      <AccountContentList
        items={contents}
        showCreateButton
      />
    </AccountLayout>
  );
}
