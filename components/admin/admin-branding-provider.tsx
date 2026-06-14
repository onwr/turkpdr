"use client";

import { createContext, useContext } from "react";

import type { SiteBranding } from "@/components/shared/site-brand";

const defaultBranding: SiteBranding = {
  siteName: "TürkPDR",
  logoUrl: undefined,
};

const AdminBrandingContext = createContext<SiteBranding>(defaultBranding);

type AdminBrandingProviderProps = {
  branding: SiteBranding;
  children: React.ReactNode;
};

export function AdminBrandingProvider({
  branding,
  children,
}: AdminBrandingProviderProps) {
  return (
    <AdminBrandingContext.Provider value={branding}>
      {children}
    </AdminBrandingContext.Provider>
  );
}

export function useAdminBranding(): SiteBranding {
  return useContext(AdminBrandingContext);
}
