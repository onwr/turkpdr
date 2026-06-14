import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { requireAccountUser } from "@/lib/account/require-user";

export const dynamic = "force-dynamic";

export default async function HesabimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAccountUser("/hesabim");

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
