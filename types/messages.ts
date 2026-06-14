export type ConversationFilter = "all" | "unread" | "archived";

export type ConversationItem = {
  userId: string;
  userName: string;
  userAvatar: string;
  userTitle: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isArchived: boolean;
};

export type MessageItem = {
  id: string;
  message: string;
  isRead: boolean;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isMine: boolean;
  pending?: boolean;
  failed?: boolean;
};

export type ChatPartner = {
  id: string;
  name: string;
  avatar: string;
  title: string | null;
};
