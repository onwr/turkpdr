import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
  children?: ReactNode;
};

export function PageHeader({
  title,
  description,
  badge,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-10 max-w-3xl", className)}>
      {badge && (
        <span className="mb-3 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">
          {badge}
        </span>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
