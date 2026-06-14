import type { AppContentStatus } from "@/types/content";

import { contentStatusLabels, contentStatusStyles } from "@/types/content";
import { cn } from "@/lib/utils";

type ContentStatusBadgeProps = {
  status: AppContentStatus;
  className?: string;
};

export function ContentStatusBadge({
  status,
  className,
}: ContentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        contentStatusStyles[status],
        className
      )}
    >
      {contentStatusLabels[status]}
    </span>
  );
}
