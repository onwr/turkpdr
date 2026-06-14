import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contentStatusLabels, type AppContentStatus } from "@/types/content";

const statusVariant: Record<
  AppContentStatus,
  "secondary" | "outline" | "default" | "destructive"
> = {
  DRAFT: "secondary",
  PENDING: "outline",
  PUBLISHED: "default",
  REJECTED: "destructive",
  REVISION_REQUESTED: "outline",
};

type EditorHeaderProps = {
  status: AppContentStatus;
  lastSaved?: string;
  mode: "create" | "edit";
  backHref?: string;
  backLabel?: string;
  pageTitle?: string;
  breadcrumbLabel?: string;
};

export function EditorHeader({
  status,
  lastSaved,
  mode,
  backHref = "/admin/contents",
  backLabel = "İçerikler",
  pageTitle = "İçerik Editörü",
  breadcrumbLabel = "İçerikler",
}: EditorHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>
        <div>
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href={backHref} className="hover:text-brand-blue">
                  {breadcrumbLabel}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-brand-navy">
                {mode === "edit" ? "Düzenle" : "Yeni"}
              </li>
            </ol>
          </nav>
          <h1 className="mt-1 text-xl font-semibold text-brand-navy sm:text-2xl">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {lastSaved && (
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
            <Save className="size-3.5" />
            {lastSaved}
          </span>
        )}
        <Badge variant={statusVariant[status]}>
          {contentStatusLabels[status]}
        </Badge>
      </div>
    </div>
  );
}
