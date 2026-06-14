import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PublicPageShell } from "@/components/shared/public-page-shell";
import { TestTakePage } from "@/components/tests/test-take-page";
import { Button } from "@/components/ui/button";
import { getTestTakePageData } from "@/lib/queries/test-take";
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
    return { title: "Test Bulunamadı | TürkPDR" };
  }

  return {
    title: `${test.title} - Test Çöz | TürkPDR`,
    description: test.description,
  };
}

export default async function TestTakeRoute({ params }: PageProps) {
  const { slug } = await params;
  const test = await getTestBySlug(slug);

  if (!test) {
    notFound();
  }

  const data = await getTestTakePageData(slug);

  if (!data) {
    return (
      <PublicPageShell>
        <main className="min-h-[50vh] bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-muted-foreground">
                Bu test için henüz soru eklenmemiş.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href={`/test-merkezi/${slug}`}>
                  <ArrowLeft className="size-4" />
                  Teste Dön
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>
      <TestTakePage slug={slug} data={data} />
    </PublicPageShell>
  );
}
