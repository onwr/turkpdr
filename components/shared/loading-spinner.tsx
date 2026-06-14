import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "size-5",
  md: "size-8",
  lg: "size-12",
};

export function LoadingSpinner({
  label = "Yükleniyor...",
  className,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn("animate-spin text-brand-blue", sizeClasses[size])}
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
