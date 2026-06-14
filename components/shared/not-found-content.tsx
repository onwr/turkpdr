import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PublicPageShell } from "@/components/shared/public-page-shell";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <PublicPageShell>
      <main className="flex min-h-[60vh] items-center bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-2xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-blue/10 text-brand-blue">
            <FileQuestion className="size-10" />
          </div>
          <PageHeader
            title="Sayfa Bulunamadı"
            description="Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir."
            className="mx-auto text-center"
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button className="rounded-xl bg-brand-blue" asChild>
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/arama">
                <ArrowLeft className="size-4" />
                Arama Yap
              </Link>
            </Button>
          </div>
          <p className="mt-10 text-6xl font-bold text-slate-100">404</p>
        </div>
      </main>
    </PublicPageShell>
  );
}
