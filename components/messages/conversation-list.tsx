"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ArchiveRestore, Loader2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConversationFilter, ConversationItem } from "@/types/messages";
import { cn } from "@/lib/utils";

function formatConversationTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

const FILTER_TABS: { value: ConversationFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "unread", label: "Okunmamış" },
  { value: "archived", label: "Arşiv" },
];

type ConversationListProps = {
  conversations: ConversationItem[];
  activeUserId?: string;
  loading?: boolean;
  filter: ConversationFilter;
  search: string;
  basePath: string;
  onFilterChange: (filter: ConversationFilter) => void;
  onSearchChange: (search: string) => void;
  onArchiveToggle: (partnerId: string, isArchived: boolean) => void;
  className?: string;
};

export function ConversationList({
  conversations,
  activeUserId,
  loading,
  filter,
  search,
  basePath,
  onFilterChange,
  onSearchChange,
  onArchiveToggle,
  className,
}: ConversationListProps) {
  const pathname = usePathname();

  const emptyMessage =
    filter === "archived"
      ? "Arşivlenmiş konuşma yok."
      : filter === "unread"
        ? "Okunmamış mesajınız yok."
        : search.trim()
          ? "Arama sonucu bulunamadı."
          : "Henüz mesajınız yok.";

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white",
        className
      )}
    >
      <div className="space-y-3 border-b border-slate-100 px-4 py-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-navy">Mesajlar</h2>
          <p className="text-xs text-muted-foreground">
            {conversations.length} konuşma
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Konuşma ara..."
            className="rounded-xl pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onFilterChange(tab.value)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                filter === tab.value
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-muted-foreground hover:text-brand-navy"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul>
            {conversations.map((conversation) => {
              const href = `${basePath}/${conversation.userId}`;
              const isActive =
                activeUserId === conversation.userId || pathname === href;

              return (
                <li key={conversation.userId}>
                  <div
                    className={cn(
                      "group flex items-start gap-2 border-b border-slate-50 px-3 py-3 transition-colors hover:bg-slate-50",
                      isActive && "bg-brand-blue/5"
                    )}
                  >
                    <Link
                      href={href}
                      className="flex min-w-0 flex-1 items-start gap-3"
                    >
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={conversation.userAvatar}
                          alt={conversation.userName}
                          fill
                          className="object-cover"
                          sizes="44px"
                          unoptimized={
                            conversation.userAvatar.startsWith("/uploads/")
                          }
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium text-brand-navy">
                            {conversation.userName}
                          </p>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatConversationTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        {conversation.userTitle && (
                          <p className="truncate text-xs text-muted-foreground">
                            {conversation.userTitle}
                          </p>
                        )}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="size-5 shrink-0 justify-center rounded-full p-0 text-[10px]"
                            >
                              {conversation.unreadCount > 9
                                ? "9+"
                                : conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      title={
                        conversation.isArchived
                          ? "Arşivden çıkar"
                          : "Arşivle"
                      }
                      onClick={() =>
                        onArchiveToggle(
                          conversation.userId,
                          conversation.isArchived
                        )
                      }
                    >
                      {conversation.isArchived ? (
                        <ArchiveRestore className="size-4" />
                      ) : (
                        <Archive className="size-4" />
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
