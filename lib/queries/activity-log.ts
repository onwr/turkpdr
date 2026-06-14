import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_LABELS,
  ACTIVITY_ENTITY_TYPES,
  type ActivityAction,
  type ActivityEntityType,
} from "@/lib/activity-log";
import type { ActivityLogItem } from "@/types/activity";

const activityInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
} as const;

function formatActivityDateTime(date: Date): string {
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function serializeActivityLog(
  item: Prisma.ActivityLogGetPayload<{ include: typeof activityInclude }>
): ActivityLogItem {
  return {
    id: item.id,
    action: item.action,
    actionLabel:
      ACTIVITY_ACTION_LABELS[item.action as ActivityAction] ?? item.action,
    entityType: item.entityType,
    entityTypeLabel:
      ACTIVITY_ENTITY_LABELS[item.entityType as ActivityEntityType] ??
      item.entityType,
    entityId: item.entityId,
    description: item.description,
    metadata: item.metadata,
    createdAt: item.createdAt.toISOString(),
    createdAtLabel: formatActivityDateTime(item.createdAt),
    user: item.user
      ? {
          id: item.user.id,
          name: item.user.name,
          email: item.user.email,
          avatar: item.user.avatar,
        }
      : null,
  };
}

export type ActivityLogFilters = {
  userId?: string;
  action?: string;
  entityType?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  limit: number;
  skip: number;
};

export function buildActivityWhere(
  filters: Omit<ActivityLogFilters, "page" | "limit" | "skip">
): Prisma.ActivityLogWhereInput {
  const where: Prisma.ActivityLogWhereInput = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search, mode: "insensitive" } },
      { action: { contains: filters.search, mode: "insensitive" } },
      {
        user: {
          name: { contains: filters.search, mode: "insensitive" },
        },
      },
      {
        user: {
          email: { contains: filters.search, mode: "insensitive" },
        },
      },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.createdAt.lte = filters.dateTo;
    }
  }

  return where;
}

export async function getActivityLogs(filters: ActivityLogFilters) {
  const where = buildActivityWhere(filters);

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip: filters.skip,
      take: filters.limit,
      orderBy: { createdAt: "desc" },
      include: activityInclude,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    activities: items.map(serializeActivityLog),
    total,
  };
}

export async function getLatestActivities(limit = 8) {
  const items = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: activityInclude,
  });

  return items.map(serializeActivityLog);
}

export function getActivityFilterOptions() {
  return {
    actions: Object.values(ACTIVITY_ACTIONS).map((action) => ({
      value: action,
      label: ACTIVITY_ACTION_LABELS[action],
    })),
    entityTypes: Object.values(ACTIVITY_ENTITY_TYPES).map((entityType) => ({
      value: entityType,
      label: ACTIVITY_ENTITY_LABELS[entityType],
    })),
  };
}

export function parseActivityDate(value: string | null): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

export function parseActivityEndDate(value: string | null): Date | undefined {
  const date = parseActivityDate(value);
  if (!date) return undefined;
  date.setHours(23, 59, 59, 999);
  return date;
}
