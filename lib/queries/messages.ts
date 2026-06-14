import { prisma } from "@/lib/prisma";
import { DEFAULT_AVATAR } from "@/lib/queries/constants";
import type {
  ChatPartner,
  ConversationFilter,
  ConversationItem,
  MessageItem,
} from "@/types/messages";

const userSelect = {
  id: true,
  name: true,
  avatar: true,
  title: true,
} as const;

export function serializeMessage(
  msg: {
    id: string;
    message: string;
    isRead: boolean;
    senderId: string;
    receiverId: string;
    createdAt: Date;
  },
  currentUserId: string
): MessageItem {
  return {
    id: msg.id,
    message: msg.message,
    isRead: msg.isRead,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    createdAt: msg.createdAt.toISOString(),
    isMine: msg.senderId === currentUserId,
  };
}

export type GetConversationsOptions = {
  filter?: ConversationFilter;
  search?: string;
};

export async function getConversations(
  userId: string,
  options: GetConversationsOptions = {}
): Promise<ConversationItem[]> {
  const { filter = "all", search = "" } = options;
  const searchLower = search.trim().toLowerCase();

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: userSelect },
      receiver: { select: userSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversationMap = new Map<string, ConversationItem>();

  for (const msg of messages) {
    const isSent = msg.senderId === userId;
    const partner = isSent ? msg.receiver : msg.sender;
    const partnerId = partner.id;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        userId: partnerId,
        userName: partner.name,
        userAvatar: partner.avatar ?? DEFAULT_AVATAR,
        userTitle: partner.title,
        lastMessage: msg.message,
        lastMessageAt: msg.createdAt.toISOString(),
        unreadCount: 0,
        isArchived: false,
      });
    }
  }

  const [unreadGroups, states] = await Promise.all([
    prisma.message.groupBy({
      by: ["senderId"],
      where: {
        receiverId: userId,
        isRead: false,
      },
      _count: { id: true },
    }),
    prisma.messageConversationState.findMany({
      where: { userId },
      select: { partnerId: true, isArchived: true },
    }),
  ]);

  const archivedPartners = new Set(
    states.filter((s) => s.isArchived).map((s) => s.partnerId)
  );

  for (const group of unreadGroups) {
    const conversation = conversationMap.get(group.senderId);
    if (conversation) {
      conversation.unreadCount = group._count.id;
    }
  }

  let conversations = Array.from(conversationMap.values()).map((c) => ({
    ...c,
    isArchived: archivedPartners.has(c.userId),
  }));

  if (filter === "all") {
    conversations = conversations.filter((c) => !c.isArchived);
  } else if (filter === "unread") {
    conversations = conversations.filter(
      (c) => !c.isArchived && c.unreadCount > 0
    );
  } else if (filter === "archived") {
    conversations = conversations.filter((c) => c.isArchived);
  }

  if (searchLower) {
    conversations = conversations.filter(
      (c) =>
        c.userName.toLowerCase().includes(searchLower) ||
        (c.userTitle?.toLowerCase().includes(searchLower) ?? false) ||
        c.lastMessage.toLowerCase().includes(searchLower)
    );
  }

  return conversations.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function getChatMessages(
  currentUserId: string,
  partnerId: string
): Promise<{
  messages: MessageItem[];
  partner: ChatPartner | null;
  isArchived: boolean;
}> {
  const partner = await prisma.user.findUnique({
    where: { id: partnerId, status: "ACTIVE" },
    select: userSelect,
  });

  if (!partner) {
    return { messages: [], partner: null, isArchived: false };
  }

  const [messages, state] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.messageConversationState.findUnique({
      where: {
        userId_partnerId: { userId: currentUserId, partnerId },
      },
      select: { isArchived: true },
    }),
  ]);

  return {
    messages: messages.map((msg) => serializeMessage(msg, currentUserId)),
    partner: {
      id: partner.id,
      name: partner.name,
      avatar: partner.avatar ?? DEFAULT_AVATAR,
      title: partner.title,
    },
    isArchived: state?.isArchived ?? false,
  };
}

export async function markConversationRead(
  currentUserId: string,
  partnerId: string
) {
  return prisma.message.updateMany({
    where: {
      senderId: partnerId,
      receiverId: currentUserId,
      isRead: false,
    },
    data: { isRead: true },
  });
}

export async function archiveConversation(userId: string, partnerId: string) {
  return prisma.messageConversationState.upsert({
    where: {
      userId_partnerId: { userId, partnerId },
    },
    create: { userId, partnerId, isArchived: true },
    update: { isArchived: true },
  });
}

export async function unarchiveConversation(userId: string, partnerId: string) {
  return prisma.messageConversationState.upsert({
    where: {
      userId_partnerId: { userId, partnerId },
    },
    create: { userId, partnerId, isArchived: false },
    update: { isArchived: false },
  });
}

export async function unarchiveConversationForReceiver(
  receiverId: string,
  senderId: string
) {
  return prisma.messageConversationState.upsert({
    where: {
      userId_partnerId: { userId: receiverId, partnerId: senderId },
    },
    create: { userId: receiverId, partnerId: senderId, isArchived: false },
    update: { isArchived: false },
  });
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  text: string
) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        message: text,
        senderId,
        receiverId,
      },
    }),
    prisma.messageConversationState.upsert({
      where: {
        userId_partnerId: { userId: receiverId, partnerId: senderId },
      },
      create: { userId: receiverId, partnerId: senderId, isArchived: false },
      update: { isArchived: false },
    }),
  ]);

  return message;
}

export async function getTotalUnreadCount(userId: string) {
  return prisma.message.count({
    where: { receiverId: userId, isRead: false },
  });
}

export function parseConversationFilter(
  value: string | null
): ConversationFilter {
  if (value === "unread" || value === "archived") return value;
  return "all";
}
