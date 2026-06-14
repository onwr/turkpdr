import type { ContentStatus, DictionaryStatus } from "@prisma/client";

export function parseScheduledAtInput(
  value: string | null | undefined
): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatScheduledAtForInput(
  value: Date | string | null | undefined
): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function isScheduledInFuture(
  scheduledAt: Date | null | undefined,
  now: Date = new Date()
): boolean {
  return !!scheduledAt && scheduledAt.getTime() > now.getTime();
}

export function resolveContentPublishFields(options: {
  status: ContentStatus;
  scheduledAt: Date | null;
  existingPublishedAt?: Date | null;
  now?: Date;
}) {
  const now = options.now ?? new Date();
  const { status, scheduledAt, existingPublishedAt = null } = options;
  const future = isScheduledInFuture(scheduledAt, now);

  if (status === "PUBLISHED") {
    if (future) {
      return {
        status: "PUBLISHED" as const,
        scheduledAt,
        publishedAt: existingPublishedAt,
      };
    }

    return {
      status: "PUBLISHED" as const,
      scheduledAt: null,
      publishedAt: existingPublishedAt ?? now,
    };
  }

  if (status === "REJECTED" || status === "DRAFT" || status === "PENDING") {
    return {
      status,
      scheduledAt,
      publishedAt: null,
    };
  }

  return {
    status,
    scheduledAt,
    publishedAt: existingPublishedAt,
  };
}

export function resolveDictionaryPublishFields(options: {
  status: DictionaryStatus;
  scheduledAt: Date | null;
  now?: Date;
}) {
  const now = options.now ?? new Date();
  const { status, scheduledAt } = options;
  const future = isScheduledInFuture(scheduledAt, now);

  if (status === "PUBLISHED") {
    if (future) {
      return {
        status: "PUBLISHED" as const,
        scheduledAt,
      };
    }

    return {
      status: "PUBLISHED" as const,
      scheduledAt: null,
    };
  }

  return {
    status,
    scheduledAt,
  };
}

export function resolveTestPublishFields(options: {
  status: ContentStatus;
  scheduledAt: Date | null;
  now?: Date;
}) {
  const now = options.now ?? new Date();
  const { status, scheduledAt } = options;
  const future = isScheduledInFuture(scheduledAt, now);

  if (status === "PUBLISHED") {
    if (future) {
      return {
        status: "PUBLISHED" as const,
        scheduledAt,
      };
    }

    return {
      status: "PUBLISHED" as const,
      scheduledAt: null,
    };
  }

  return {
    status,
    scheduledAt,
  };
}

export function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  return authHeader.slice(7) === secret;
}
