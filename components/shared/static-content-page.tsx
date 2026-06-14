import type { ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { PublicPageShell } from "@/components/shared/public-page-shell";

type StaticContentPageProps = {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
};

export function StaticContentPage({
  title,
  description,
  badge,
  children,
}: StaticContentPageProps) {
  return (
    <PublicPageShell>
      <main className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <PageHeader title={title} description={description} badge={badge} />
          <div className="prose prose-slate max-w-none prose-headings:text-brand-navy prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600">
            {children}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}
