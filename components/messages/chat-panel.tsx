"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { messagesFingerprint } from "@/lib/messages/utils";
import type { ChatPartner, MessageItem } from "@/types/messages";
import { cn } from "@/lib/utils";

const CHAT_POLL_MS = 5_000;

function formatMessageTime(date: string): string {
  return new Date(date).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageDeliveryStatus({ message }: { message: MessageItem }) {
  if (!message.isMine) return null;

  if (message.pending) {
    return (
      <span className="inline-flex items-center gap-1 text-white/80">
        <Loader2 className="size-3.5 animate-spin" />
        Gönderiliyor
      </span>
    );
  }

  if (message.isRead) {
    return (
      <span
        className="inline-flex items-center gap-1 text-white/90"
        title="Karşı taraf okudu"
      >
        <CheckCheck className="size-3.5" />
        Okundu
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-white/80"
      title="Karşı tarafa iletildi, henüz okunmadı"
    >
      <Check className="size-3.5" />
      İletildi
    </span>
  );
}

type ChatPanelProps = {
  partnerId: string;
  basePath?: string;
  onMessageSent?: () => void;
  onArchiveToggle?: (isArchived: boolean) => void;
};

export function ChatPanel({
  partnerId,
  basePath = "/mesajlar",
  onMessageSent,
  onArchiveToggle,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fingerprintRef = useRef("");
  const shouldScrollOnLoadRef = useRef(true);
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [markingRead, setMarkingRead] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const unreadIncomingCount = messages.filter(
    (m) => !m.isMine && !m.isRead && !m.pending
  ).length;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  const preserveScrollPosition = useCallback((update: () => void) => {
    const el = scrollContainerRef.current;
    const scrollTop = el?.scrollTop ?? 0;
    update();
    requestAnimationFrame(() => {
      if (el) el.scrollTop = scrollTop;
    });
  }, []);

  const markAsRead = useCallback(async () => {
    setMarkingRead(true);
    try {
      const res = await fetch(`/api/messages/${partnerId}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (!m.isMine ? { ...m, isRead: true } : m))
        );
      }
    } finally {
      setMarkingRead(false);
    }
  }, [partnerId]);

  const fetchMessages = useCallback(
    async (options?: { silent?: boolean; markRead?: boolean }) => {
      const silent = options?.silent ?? false;
      const shouldMarkRead = options?.markRead ?? !silent;

      if (!silent) {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetch(`/api/messages/${partnerId}`);
        const data = (await res.json()) as {
          messages?: MessageItem[];
          partner?: ChatPartner | null;
          isArchived?: boolean;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error || "Mesajlar yüklenemedi.");
        }

        const nextMessages = data.messages ?? [];
        const nextFingerprint = messagesFingerprint(nextMessages);

        if (nextFingerprint !== fingerprintRef.current) {
          const wasNearBottom = isNearBottom();
          fingerprintRef.current = nextFingerprint;
          setMessages((prev) => {
            const pending = prev.filter((m) => m.pending);
            return pending.length > 0
              ? [...nextMessages, ...pending]
              : nextMessages;
          });

          if (!silent && shouldScrollOnLoadRef.current) {
            shouldScrollOnLoadRef.current = false;
            requestAnimationFrame(() => scrollToBottom("auto"));
          } else if (silent && wasNearBottom) {
            const last = nextMessages[nextMessages.length - 1];
            if (last?.senderId === partnerId) {
              requestAnimationFrame(() => scrollToBottom("auto"));
            }
          }
        }

        if (data.partner) {
          setPartner(data.partner);
        }

        if (typeof data.isArchived === "boolean") {
          setIsArchived(data.isArchived);
        }

        if (
          shouldMarkRead &&
          nextMessages.some((m) => !m.isMine && !m.isRead)
        ) {
          await markAsRead();
        }
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [partnerId, markAsRead, scrollToBottom, isNearBottom]
  );

  useEffect(() => {
    shouldScrollOnLoadRef.current = true;
    fingerprintRef.current = "";
    const timeoutId = window.setTimeout(() => {
      void fetchMessages({ markRead: true });
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchMessages({ silent: true, markRead: true });
    }, CHAT_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchMessages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: optimisticId,
      message: text,
      isRead: false,
      senderId: "me",
      receiverId: partnerId,
      createdAt: new Date().toISOString(),
      isMine: true,
      pending: true,
    };

    setDraft("");
    setSending(true);
    setError(null);
    preserveScrollPosition(() => {
      setMessages((prev) => [...prev, optimisticMessage]);
    });

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: partnerId, message: text }),
      });
      const data = (await res.json()) as {
        message?: MessageItem;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Mesaj gönderilemedi.");
      }

      const confirmed = data.message as MessageItem;
      preserveScrollPosition(() => {
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === optimisticId ? confirmed : m
          );
          fingerprintRef.current = messagesFingerprint(
            updated.filter((m) => !m.pending)
          );
          return updated;
        });
      });
      onMessageSent?.();
    } catch (err) {
      preserveScrollPosition(() => {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      });
      setDraft(text);
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleArchive = async () => {
    const endpoint = isArchived ? "unarchive" : "archive";
    const res = await fetch(`/api/messages/${partnerId}/${endpoint}`, {
      method: "PATCH",
    });
    if (res.ok) {
      setIsArchived(!isArchived);
      onArchiveToggle?.(!isArchived);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error && !partner) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button variant="outline" onClick={() => void fetchMessages()}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="flex h-full flex-1 flex-col bg-slate-50/50">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          asChild
        >
          <Link href={basePath} aria-label="Konuşmalara dön">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
          <Image
            src={partner.avatar}
            alt={partner.name}
            fill
            className="object-cover"
            sizes="40px"
            unoptimized={partner.avatar.startsWith("/uploads/")}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-brand-navy">
            {partner.name}
          </p>
          {partner.title && (
            <p className="truncate text-xs text-muted-foreground">
              {partner.title}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {unreadIncomingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="hidden text-xs sm:inline-flex"
              disabled={markingRead}
              onClick={() => void markAsRead()}
            >
              {markingRead ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCheck className="size-3" />
              )}
              Okundu
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            title={isArchived ? "Arşivden çıkar" : "Arşivle"}
            onClick={() => void handleArchive()}
          >
            {isArchived ? (
              <ArchiveRestore className="size-4" />
            ) : (
              <Archive className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-brand-navy">
              Henüz mesaj yok
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {partner.name} ile sohbete başlamak için aşağıdan ilk mesajınızı
              gönderin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.isMine ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%]",
                    msg.isMine
                      ? "rounded-br-md bg-brand-blue text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-brand-navy",
                    msg.pending && "opacity-70"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {msg.message}
                  </p>
                  <div
                    className={cn(
                      "mt-1.5 flex items-center justify-end gap-2 text-[11px]",
                      msg.isMine ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    <MessageDeliveryStatus message={msg} />
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın... (Enter: gönder, Shift+Enter: yeni satır)"
            className="min-h-[44px] max-h-32 resize-none rounded-xl"
            maxLength={2000}
            disabled={sending}
            rows={1}
          />
          <Button
            type="button"
            className="shrink-0 self-end rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
            disabled={sending || !draft.trim()}
            onClick={() => void handleSend()}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

type ChatEmptyStateProps = {
  className?: string;
};

export function ChatEmptyState({ className }: ChatEmptyStateProps) {
  return (
    <div
      className={cn(
        "hidden flex-1 flex-col items-center justify-center bg-slate-50/50 text-center lg:flex",
        className
      )}
    >
      <p className="text-lg font-medium text-brand-navy">
        Bir konuşma seçin
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Sol taraftan bir konuşma seçerek mesajlaşmaya başlayın veya bir profilden
        mesaj gönderin.
      </p>
    </div>
  );
}
