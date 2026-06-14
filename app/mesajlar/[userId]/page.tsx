import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { MessagesApp } from "@/components/messages/messages-app";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { getCurrentUser } from "@/lib/auth";
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
    title: partner ? `${partner.name} ile Mesajlar` : "Mesajlar",
  };
}

export default async function MesajlarChatPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    const { userId } = await params;
    redirect(`/giris?callbackUrl=/mesajlar/${userId}&error=oturum`);
  }

  const { userId } = await params;

  if (userId === user.id) {
    redirect("/mesajlar");
  }

  const partner = await prisma.user.findUnique({
    where: { id: userId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!partner) {
    redirect("/mesajlar");
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <MessageSquare className="size-5 text-brand-blue" />
            <h1 className="text-xl font-bold text-brand-navy">Mesajlar</h1>
          </div>
          <MessagesApp activeUserId={userId} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
