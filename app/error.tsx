"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-lg px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-red-50 text-red-600">
            <AlertTriangle className="size-10" />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Bir Hata Oluştu
          </h1>
          <p className="mt-3 text-muted-foreground">
            Beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin veya ana
            sayfaya dönün.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button className="rounded-xl bg-brand-blue" onClick={reset}>
              <RefreshCw className="size-4" />
              Tekrar Dene
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/">Ana Sayfa</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
