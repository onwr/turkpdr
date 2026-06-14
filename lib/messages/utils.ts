import type { ConversationItem, MessageItem } from "@/types/messages";

export function messagesFingerprint(messages: MessageItem[]): string {
  return messages.map((m) => `${m.id}:${m.isRead}`).join("|");
}

export function conversationsFingerprint(
  conversations: ConversationItem[]
): string {
  return conversations
    .map(
      (c) =>
        `${c.userId}:${c.unreadCount}:${c.lastMessageAt}:${c.isArchived}:${c.lastMessage}`
    )
    .join("|");
}

export function buildMessagesQuery(
  filter: string,
  search: string
): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (search.trim()) params.set("search", search.trim());
  const query = params.toString();
  return query ? `?${query}` : "";
}
