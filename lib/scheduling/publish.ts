import type { ContentStatus } from "@prisma/client";

import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import { NOT_DELETED_WHERE } from "@/lib/trash/utils";

type PublishSummary = {
  contents: number;
  dictionaryTerms: number;
  tests: number;
};

export async function publishDueScheduledItems(
  now: Date = new Date()
): Promise<PublishSummary> {
  const dueWhere = {
    ...NOT_DELETED_WHERE,
    scheduledAt: { lte: now, not: null },
    status: { in: ["DRAFT", "PENDING"] as ContentStatus[] },
  };

  const [dueContents, dueDictionaryTerms, dueTests] = await Promise.all([
    prisma.content.findMany({
      where: dueWhere,
      select: { id: true, title: true },
    }),
    prisma.dictionaryTerm.findMany({
      where: {
        ...NOT_DELETED_WHERE,
        scheduledAt: { lte: now, not: null },
        status: "DRAFT",
      },
      select: { id: true, title: true },
    }),
    prisma.test.findMany({
      where: dueWhere,
      select: { id: true, title: true },
    }),
  ]);

  await Promise.all([
    ...dueContents.map((item) =>
      prisma.content.update({
        where: { id: item.id },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
          scheduledAt: null,
        },
      })
    ),
    ...dueDictionaryTerms.map((item) =>
      prisma.dictionaryTerm.update({
        where: { id: item.id },
        data: {
          status: "PUBLISHED",
          scheduledAt: null,
        },
      })
    ),
    ...dueTests.map((item) =>
      prisma.test.update({
        where: { id: item.id },
        data: {
          status: "PUBLISHED",
          scheduledAt: null,
        },
      })
    ),
  ]);

  await Promise.all([
    ...dueContents.map((item) =>
      logActivity({
        action: ACTIVITY_ACTIONS.CONTENT_PUBLISHED,
        entityType: ACTIVITY_ENTITY_TYPES.CONTENT,
        entityId: item.id,
        description: `"${item.title}" zamanlanmış yayın ile yayınlandı`,
        metadata: { source: "cron" },
      })
    ),
    ...dueDictionaryTerms.map((item) =>
      logActivity({
        action: ACTIVITY_ACTIONS.DICTIONARY_PUBLISHED,
        entityType: ACTIVITY_ENTITY_TYPES.DICTIONARY,
        entityId: item.id,
        description: `"${item.title}" zamanlanmış yayın ile yayınlandı`,
        metadata: { source: "cron" },
      })
    ),
    ...dueTests.map((item) =>
      logActivity({
        action: ACTIVITY_ACTIONS.TEST_PUBLISHED,
        entityType: ACTIVITY_ENTITY_TYPES.TEST,
        entityId: item.id,
        description: `"${item.title}" zamanlanmış yayın ile yayınlandı`,
        metadata: { source: "cron" },
      })
    ),
  ]);

  const delayedPublished = await prisma.content.findMany({
    where: {
      ...NOT_DELETED_WHERE,
      status: "PUBLISHED",
      scheduledAt: { lte: now, not: null },
    },
    select: { id: true, scheduledAt: true, publishedAt: true },
  });

  await Promise.all(
    delayedPublished.map((item) =>
      prisma.content.update({
        where: { id: item.id },
        data: {
          publishedAt: item.publishedAt ?? item.scheduledAt ?? now,
          scheduledAt: null,
        },
      })
    )
  );

  const delayedDictionary = await prisma.dictionaryTerm.findMany({
    where: {
      ...NOT_DELETED_WHERE,
      status: "PUBLISHED",
      scheduledAt: { lte: now, not: null },
    },
    select: { id: true },
  });

  await Promise.all(
    delayedDictionary.map((item) =>
      prisma.dictionaryTerm.update({
        where: { id: item.id },
        data: { scheduledAt: null },
      })
    )
  );

  const delayedTests = await prisma.test.findMany({
    where: {
      ...NOT_DELETED_WHERE,
      status: "PUBLISHED",
      scheduledAt: { lte: now, not: null },
    },
    select: { id: true },
  });

  await Promise.all(
    delayedTests.map((item) =>
      prisma.test.update({
        where: { id: item.id },
        data: { scheduledAt: null },
      })
    )
  );

  return {
    contents: dueContents.length,
    dictionaryTerms: dueDictionaryTerms.length,
    tests: dueTests.length,
  };
}
