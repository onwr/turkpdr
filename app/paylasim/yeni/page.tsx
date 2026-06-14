import { redirect } from "next/navigation";

import { ProfileShareForm } from "@/components/profile/profile-share-form";
import { PublicPageShell } from "@/components/shared/public-page-shell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewSharePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/giris?callbackUrl=${encodeURIComponent("/paylasim/yeni")}`);
  }

  const categories = await prisma.category.findMany({
    where: { type: "ARTICLE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <PublicPageShell>
      <ProfileShareForm userId={currentUser.id} categories={categories} />
    </PublicPageShell>
  );
}
