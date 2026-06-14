"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { useMessageUnreadCount } from "@/components/messages/use-unread-count";
import { cn } from "@/lib/utils";

type MessageUnreadBadgeProps = {
  className?: string;
  layout?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function MessageUnreadBadge({
  className,
  layout = "desktop",
  onNavigate,
}: MessageUnreadBadgeProps) {
  const { count } = useMessageUnreadCount();

  return (
    <Link
      href="/mesajlar"
      onClick={onNavigate}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl border border-border/60 transition-colors hover:bg-brand-blue/5",
        layout === "desktop" ? "size-9" : "size-10",
        className
      )}
      aria-label={
        count > 0
          ? `Mesajlar, ${count} okunmamış`
          : "Mesajlar"
      }
    >
      <MessageSquare className="size-4 text-brand-navy" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
