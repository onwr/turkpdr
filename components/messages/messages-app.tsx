"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChatEmptyState, ChatPanel } from "@/components/messages/chat-panel";
import { ConversationList } from "@/components/messages/conversation-list";
import {
  buildMessagesQuery,
  conversationsFingerprint,
} from "@/lib/messages/utils";
import type { ConversationFilter, ConversationItem } from "@/types/messages";
import { cn } from "@/lib/utils";

const CONVERSATIONS_POLL_MS = 10_000;

type MessagesAppProps = {
  activeUserId?: string;
  basePath?: string;
};

export function MessagesApp({
  activeUserId,
  basePath = "/mesajlar",
}: MessagesAppProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const fingerprintRef = useRef("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchConversations = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setLoading(true);

      try {
        const query = buildMessagesQuery(filter, debouncedSearch);
        const res = await fetch(`/api/messages${query}`);
        const data = (await res.json()) as {
          conversations?: ConversationItem[];
        };

        if (res.ok && data.conversations) {
          const nextFingerprint = conversationsFingerprint(data.conversations);
          if (nextFingerprint !== fingerprintRef.current) {
            fingerprintRef.current = nextFingerprint;
            setConversations(data.conversations);
          }
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [filter, debouncedSearch]
  );

  useEffect(() => {
    fingerprintRef.current = "";
    const timeoutId = window.setTimeout(() => {
      void fetchConversations();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchConversations]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchConversations({ silent: true });
    }, CONVERSATIONS_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchConversations]);

  const handleArchiveToggle = useCallback(
    async (partnerId: string, isArchived: boolean) => {
      const endpoint = isArchived ? "unarchive" : "archive";
      const res = await fetch(`/api/messages/${partnerId}/${endpoint}`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchConversations({ silent: true });
      }
    },
    [fetchConversations]
  );

  const showListOnMobile = !activeUserId;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <div className="flex h-[calc(100vh-12rem)] min-h-[480px] max-h-[720px]">
        <ConversationList
          conversations={conversations}
          activeUserId={activeUserId}
          loading={loading}
          filter={filter}
          search={search}
          basePath={basePath}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onArchiveToggle={(partnerId, isArchived) =>
            void handleArchiveToggle(partnerId, isArchived)
          }
          className={cn(
            "w-full lg:w-80 xl:w-96",
            !showListOnMobile && "hidden lg:flex"
          )}
        />

        {activeUserId ? (
          <ChatPanel
            partnerId={activeUserId}
            basePath={basePath}
            onMessageSent={() => void fetchConversations({ silent: true })}
            onArchiveToggle={(isArchived) =>
              void handleArchiveToggle(activeUserId, isArchived)
            }
          />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
}
