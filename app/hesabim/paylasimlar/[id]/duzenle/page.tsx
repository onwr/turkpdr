import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountContentEditForm } from "@/components/account/account-content-edit-form";
import { AccountLayout } from "@/components/account/account-layout";
import { canAuthorEditContent } from "@/lib/content-review";
import { requireAccountUser } from "@/lib/account/require-user";
import { prisma } from "@/lib/prisma";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

export const metadata: Metadata = {
  title: "Paylaşımı Düzenle",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAccountPostPage({ params }: PageProps) {
  const user = await requireAccountUser("/hesabim/paylasimlar");
  const { id } = await params;

  const content = await prisma.content.findFirst({
    where: {
      id,
      authorId: user.id,
      ...NOT_DELETED_WHERE,
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  if (!content || !canAuthorEditContent(content.status)) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: { type: "ARTICLE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AccountLayout
      user={user}
      title="Paylaşımı Düzenle"
      description={`"${content.title}" içeriğini düzenleyin ve tekrar onaya gönderin.`}
    >
      <AccountContentEditForm contentId={content.id} categories={categories} />
    </AccountLayout>
  );
}
