"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="size-7" />
        </div>
        <h1 className="text-xl font-semibold text-brand-navy">
          Admin Paneli Hatası
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          İşlem sırasında bir hata oluştu. Tekrar deneyebilir veya panele
          dönebilirsiniz.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button className="rounded-xl bg-brand-blue" onClick={reset}>
            <RefreshCw className="size-4" />
            Tekrar Dene
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin">Panele Dön</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
