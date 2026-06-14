import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-background">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(59,130,246,0.08), transparent 40%), radial-gradient(circle at 10% 90%, rgba(248,250,252,0.9), transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-sky-200/30 blur-3xl dark:bg-brand-blue/10" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 size-64 rounded-full bg-blue-100/40 blur-3xl dark:bg-brand-blue/5" />

      <div className="relative flex min-h-screen w-full flex-col lg:flex-row">
        <AuthBrandPanel />

        <div className="flex min-w-0 flex-1 flex-col px-6 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-12">
          <div className="mb-6 flex items-center justify-between lg:mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-blue dark:text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              Ana sayfaya dön
            </Link>

            <Link
              href="/"
              className="transition-opacity hover:opacity-80 lg:hidden"
              aria-label="TürkPDR Ana Sayfa"
            >
              <Image
                src="/logo.png"
                alt="TürkPDR"
                width={140}
                height={32}
                className="h-9 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center pb-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
