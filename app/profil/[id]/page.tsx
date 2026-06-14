import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfilePage } from "@/components/profile/profile-page";
import { getCurrentUser } from "@/lib/auth";
import {
  getAuthorProfileIds,
  getProfilePageData,
} from "@/lib/queries/profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const ids = await getAuthorProfileIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getProfilePageData(id);

  if (!data) {
    return { title: "Profil Bulunamadı" };
  }

  const { profile } = data;

  return {
    title: profile.seoTitle,
    description: profile.seoDescription,
    openGraph: {
      title: profile.seoTitle,
      description: profile.seoDescription,
      type: "profile",
      images: [
        {
          url: profile.avatar,
          width: 400,
          height: 400,
          alt: profile.name,
        },
      ],
      locale: "tr_TR",
    },
    twitter: {
      card: "summary",
      title: profile.seoTitle,
      description: profile.seoDescription,
      images: [profile.avatar],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [data, currentUser] = await Promise.all([
    getProfilePageData(id),
    getCurrentUser(),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <ProfilePage
      profile={data.profile}
      posts={data.posts}
      files={data.files}
      favorites={data.favorites}
      popular={data.popular}
      currentUserId={currentUser?.id ?? null}
    />
  );
}
