import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { PublicPageShell } from "@/components/shared/public-page-shell";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_AVATAR } from "@/lib/queries/constants";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: user ? `${user.name} — Profil Düzenle` : "Profil Düzenle",
  };
}

export default async function ProfileEditPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/giris?callbackUrl=${encodeURIComponent(`/profil/${id}/duzenle`)}`);
  }

  if (currentUser.id !== id) {
    redirect(`/profil/${currentUser.id}`);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      title: true,
      bio: true,
      avatar: true,
      coverImage: true,
      phone: true,
      city: true,
      website: true,
      workAreas: true,
      expertiseAreas: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    notFound();
  }

  return (
    <PublicPageShell>
      <ProfileEditForm
        userId={user.id}
        initialData={{
          name: user.name,
          email: user.email,
          title: user.title ?? "",
          bio: user.bio ?? "",
          avatar: user.avatar ?? DEFAULT_AVATAR,
          coverImage: user.coverImage ?? "",
          phone: user.phone ?? "",
          city: user.city ?? "",
          website: user.website ?? "",
          workAreas: user.workAreas,
          expertiseAreas: user.expertiseAreas,
        }}
      />
    </PublicPageShell>
  );
}
