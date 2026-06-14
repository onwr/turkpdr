import Image from "next/image";
import { Brain } from "lucide-react";

import { cn } from "@/lib/utils";

export type SiteBranding = {
  siteName: string;
  logoUrl: string | undefined;
};

type SiteBrandProps = SiteBranding & {
  className?: string;
  variant?: "light" | "dark";
};

export function SiteBrand({
  siteName,
  logoUrl,
  className,
  variant = "light",
}: SiteBrandProps) {
  const resolvedLogoUrl = logoUrl || "/logo.png";

  if (resolvedLogoUrl) {
    return (
      <Image
        src={resolvedLogoUrl}
        alt={siteName}
        width={162}
        height={36}
        className={cn(
          "h-9 w-auto object-contain object-left",
          variant === "light" && "lg:h-11 2xl:h-14",
          variant === "dark" && "rounded-lg bg-white px-2 py-1",
          className
        )}
        unoptimized
        priority
      />
    );
  }

  const match = siteName.match(/^(.+?)(PDR)$/i);

  return (
    <>
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-xl text-white shadow-md",
          variant === "light"
            ? "bg-brand-navy shadow-brand-navy/20 dark:bg-brand-blue"
            : "bg-brand-blue shadow-brand-blue/25"
        )}
      >
        <Brain className="size-5" />
      </div>
      <span
        className={cn(
          "text-base font-bold tracking-tight lg:text-lg",
          variant === "light"
            ? "text-brand-navy dark:text-foreground"
            : "text-white"
        )}
      >
        {match ? (
          <>
            {match[1]}
            <span
              className={variant === "light" ? "text-brand-blue" : "text-sky-400"}
            >
              {match[2]}
            </span>
          </>
        ) : (
          siteName
        )}
      </span>
    </>
  );
}
