import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/account-layout";
import { MessagesApp } from "@/components/messages/messages-app";
import { requireAccountUser } from "@/lib/account/require-user";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const partner = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  return {
    title: partner ? `${partner.name} ile Mesajlar` : "Mesajlarım",
  };
}

export default async function AccountMessagesChatPage({ params }: PageProps) {
  const user = await requireAccountUser("/hesabim/mesajlar");
  const { userId } = await params;

  if (userId === user.id) {
    redirect("/hesabim/mesajlar");
  }

  const partner = await prisma.user.findUnique({
    where: { id: userId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!partner) {
    redirect("/hesabim/mesajlar");
  }

  return (
    <AccountLayout
      user={user}
      title="Mesajlarım"
      description="Site içi mesajlaşma ve konuşmalarınız."
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <MessagesApp
          activeUserId={userId}
          basePath="/hesabim/mesajlar"
        />
      </div>
    </AccountLayout>
  );
}
