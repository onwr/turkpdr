import type { Metadata } from "next";

import { AccountLayout } from "@/components/account/account-layout";
import { MessagesApp } from "@/components/messages/messages-app";
import { requireAccountUser } from "@/lib/account/require-user";

export const metadata: Metadata = {
  title: "Mesajlarım",
};

export default async function AccountMessagesPage() {
  const user = await requireAccountUser("/hesabim/mesajlar");

  return (
    <AccountLayout
      user={user}
      title="Mesajlarım"
      description="Site içi mesajlaşma ve konuşmalarınız."
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <MessagesApp basePath="/hesabim/mesajlar" />
      </div>
    </AccountLayout>
  );
}
