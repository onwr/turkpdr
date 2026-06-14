import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { MessagesApp } from "@/components/messages/messages-app";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mesajlar",
  description: "TürkPDR site içi mesajlaşma.",
};

export default async function MesajlarPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/giris?callbackUrl=/mesajlar&error=oturum");
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
          <MessagesApp />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
