import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.ComponentProps<"select">;

function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition-colors",
        "focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
