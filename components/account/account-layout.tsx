import type { AuthUser } from "@/lib/auth/types";

import { AccountHeader } from "@/components/account/account-header";
import { AccountSidebar } from "@/components/account/account-sidebar";

type AccountLayoutProps = {
  user: AuthUser;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AccountLayout({
  user,
  title,
  description,
  children,
}: AccountLayoutProps) {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-sky-50/70 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <AccountHeader user={user} title={title} description={description} />
        <div className="lg:flex lg:items-start lg:gap-8">
          <AccountSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
