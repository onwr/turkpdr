import Link from "next/link";
import {
  AlertCircle,
  FileText,
  Inbox,
  Search,
  Users,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateIcon =
  | "inbox"
  | "file"
  | "search"
  | "users"
  | "video"
  | "alert";

type EmptyStateAction = {
  label: string;
  href?: string;
};

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: EmptyStateIcon;
  action?: EmptyStateAction;
  className?: string;
};

const iconMap = {
  inbox: Inbox,
  file: FileText,
  search: Search,
  users: Users,
  video: Video,
  alert: AlertCircle,
} as const;

export function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
        <Icon className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {action?.href && (
        <Button className="mt-6 rounded-xl" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
