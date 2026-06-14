"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HeaderSearchProps = {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onNavigate?: () => void;
};

export function HeaderSearch({
  className,
  inputClassName,
  placeholder = "Ara...",
  onNavigate,
}: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submitSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    onNavigate?.();
    router.push(`/arama?q=${encodeURIComponent(trimmed)}`);
  }, [query, router, onNavigate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
  };

  return (
    <form
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch();
      }}
    >
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Site genelinde ara"
        className={cn("rounded-xl pl-9", inputClassName)}
      />
    </form>
  );
}

type HeaderSearchButtonProps = {
  className?: string;
  onNavigate?: () => void;
};

export function HeaderSearchLink({
  className,
  onNavigate,
}: HeaderSearchButtonProps) {
  return (
    <Link
      href="/arama"
      onClick={onNavigate}
      className={cn(
        "flex size-9 items-center justify-center rounded-xl text-brand-navy/80 transition-colors hover:bg-brand-blue/5 hover:text-brand-blue dark:text-muted-foreground",
        className
      )}
      aria-label="Arama sayfasına git"
    >
      <Search className="size-5" />
    </Link>
  );
}
