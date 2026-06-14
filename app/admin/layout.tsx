import { requireAdminAccess } from "@/lib/auth";
import { AdminBrandingProvider } from "@/components/admin/admin-branding-provider";
import { getSiteSettings } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminAccess();
  const settings = await getSiteSettings();

  return (
    <AdminBrandingProvider
      branding={{
        siteName: settings.siteName,
        logoUrl: settings.logoUrl ?? undefined,
      }}
    >
      {children}
    </AdminBrandingProvider>
  );
}
