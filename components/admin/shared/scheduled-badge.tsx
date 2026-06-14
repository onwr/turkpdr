import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatContentDate } from "@/lib/admin/content-display";
import { isScheduledInFuture } from "@/lib/scheduling/utils";

type ScheduledBadgeProps = {
  scheduledAt?: string | null;
  className?: string;
};

export function ScheduledBadge({ scheduledAt, className }: ScheduledBadgeProps) {
  if (!scheduledAt || !isScheduledInFuture(new Date(scheduledAt))) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={`rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 ${className ?? ""}`}
      title={formatContentDate(scheduledAt)}
    >
      <Clock className="size-3" />
      Zamanlandı
    </Badge>
  );
}
