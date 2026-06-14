import type { Metadata } from "next";

import { AccountLayout } from "@/components/account/account-layout";
import { AccountShareForm } from "@/components/account/account-share-form";
import { requireAccountUser } from "@/lib/account/require-user";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Yeni Paylaşım",
};

export default async function NewAccountPostPage() {
  const user = await requireAccountUser("/hesabim/paylasimlar/yeni");

  const categories = await prisma.category.findMany({
    where: { type: "ARTICLE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AccountLayout
      user={user}
      title="Yeni Paylaşım"
      description="Paylaşımınız editör onayından sonra yayınlanır."
    >
      <AccountShareForm categories={categories} />
    </AccountLayout>
  );
}
