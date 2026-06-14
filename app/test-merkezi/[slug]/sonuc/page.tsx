import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { PublicPageShell } from "@/components/shared/public-page-shell";
import { TestResultPage } from "@/components/tests/test-result-page";
import { getTestBySlug } from "@/lib/queries/tests";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const test = await getTestBySlug(slug);

  if (!test) {
    return { title: "Test Sonucu | TürkPDR" };
  }

  return {
    title: `${test.title} - Sonuç | TürkPDR`,
    description: `${test.title} test sonucunuz.`,
  };
}

function ResultFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      Sonuç yükleniyor...
    </div>
  );
}

export default async function TestResultRoute({ params }: PageProps) {
  const { slug } = await params;
  const test = await getTestBySlug(slug);

  if (!test) {
    notFound();
  }

  return (
    <PublicPageShell>
      <Suspense fallback={<ResultFallback />}>
        <TestResultPage slug={slug} />
      </Suspense>
    </PublicPageShell>
  );
}
