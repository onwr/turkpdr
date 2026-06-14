import { prisma } from "@/lib/prisma";
import { getPublicTestWhere } from "@/lib/queries/constants";
import { resolveSeo } from "@/lib/seo/metadata";
import type { PsychologicalTestDetail, TestCategory } from "@/types/test";
import { mergeSpecialTests } from "@/lib/special-tests";
import { testCategories } from "@/lib/mock-data/tests";

const CATEGORY_SLUG_TO_TEST: Record<string, TestCategory> = {
  cocuk: "cocuk",
  ergen: "ergen",
  yetiskin: "yetişkin",
  meslek: "meslek",
  klinik: "klinik",
};

const CATEGORY_LABELS: Record<TestCategory, string> = {
  cocuk: "Çocuk",
  ergen: "Ergen",
  yetişkin: "Yetişkin",
  meslek: "Meslek",
  klinik: "Klinik",
};

const testListSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  duration: true,
  questionCount: true,
  image: true,
  iframeUrl: true,
  categoryId: true,
  category: { select: { slug: true, name: true } },
} as const;

type TestListRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: string | null;
  questionCount: number | null;
  image?: string | null;
  iframeUrl?: string | null;
  category: { slug: string; name: string } | null;
};

async function getOnlineQuestionCountMap(
  testIds: string[]
): Promise<Map<string, number>> {
  if (testIds.length === 0) {
    return new Map();
  }

  const counts = await prisma.testQuestion.groupBy({
    by: ["testId"],
    where: { testId: { in: testIds } },
    _count: { _all: true },
  });

  return new Map(
    counts.map((entry) => [entry.testId, entry._count._all])
  );
}

async function getParticipantCountMap(
  testIds: string[]
): Promise<Map<string, number>> {
  if (testIds.length === 0) {
    return new Map();
  }

  const counts = await prisma.testResult.groupBy({
    by: ["testId"],
    where: { testId: { in: testIds } },
    _count: { _all: true },
  });

  return new Map(
    counts.map((entry) => [entry.testId, entry._count._all])
  );
}

function mapTest(
  test: TestListRecord,
  index: number,
  onlineQuestionCount = 0,
  participantCount = 0
): PsychologicalTestDetail {
  const category =
    CATEGORY_SLUG_TO_TEST[test.category?.slug ?? ""] ?? "klinik";

  return {
    id: test.id,
    slug: test.slug,
    title: test.title,
    category,
    categoryLabel:
      test.category?.name ?? CATEGORY_LABELS[category] ?? "Genel",
    description: test.description ?? "",
    duration: parseInt(test.duration ?? "10", 10) || 10,
    questionCount: onlineQuestionCount || test.questionCount || 0,
    difficulty: index % 3 === 0 ? "kolay" : index % 3 === 1 ? "orta" : "zor",
    participantCount,
    featured: index === 0,
    popular: index < 4,
    image: test.image ?? null,
    iframeUrl: test.iframeUrl ?? null,
    hasOnlineQuestions: onlineQuestionCount > 0,
  };
}

async function mapTestsWithCounts(
  tests: TestListRecord[]
): Promise<PsychologicalTestDetail[]> {
  const testIds = tests.map((test) => test.id);
  const [questionCountMap, participantCountMap] = await Promise.all([
    getOnlineQuestionCountMap(testIds),
    getParticipantCountMap(testIds),
  ]);

  return tests.map((test, index) =>
    mapTest(
      test,
      index,
      questionCountMap.get(test.id) ?? 0,
      participantCountMap.get(test.id) ?? 0
    )
  );
}

export async function getPublishedTestSlugs(): Promise<string[]> {
  const tests = await prisma.test.findMany({
    where: getPublicTestWhere(),
    select: { slug: true },
  });

  return tests.map((test) => test.slug);
}

export async function getTestBySlug(
  slug: string
): Promise<PsychologicalTestDetail | null> {
  const test = await prisma.test.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      ...getPublicTestWhere(),
    },
    select: testListSelect,
  });

  if (!test) return null;

  const [mapped] = await mapTestsWithCounts([test]);
  return mapped;
}

export async function getRelatedTests(
  slug: string,
  categoryId: string | null,
  limit = 3
): Promise<PsychologicalTestDetail[]> {
  const tests = await prisma.test.findMany({
    where: {
      ...getPublicTestWhere(),
      slug: { not: slug },
      ...(categoryId ? { categoryId } : {}),
    },
    select: testListSelect,
    orderBy: { title: "asc" },
    take: limit,
  });

  return mapTestsWithCounts(tests);
}

export async function getTestPageData(slug: string) {
  const test = await prisma.test.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      ...getPublicTestWhere(),
    },
    select: testListSelect,
  });

  if (!test) return null;

  const [mappedTest] = await mapTestsWithCounts([test]);
  const relatedTests = await getRelatedTests(slug, test.categoryId);

  return {
    test: mappedTest,
    relatedTests,
  };
}

export async function getAllPublishedTests(): Promise<
  PsychologicalTestDetail[]
> {
  const tests = await prisma.test.findMany({
    where: getPublicTestWhere(),
    select: testListSelect,
    orderBy: { title: "asc" },
  });

  return mergeSpecialTests(
    await mapTestsWithCounts(tests)
  );
}

export async function getFeaturedTest(): Promise<PsychologicalTestDetail | null> {
  const test = await prisma.test.findFirst({
    where: getPublicTestWhere(),
    select: testListSelect,
    orderBy: { createdAt: "asc" },
  });

  if (!test) return null;

  const [mapped] = await mapTestsWithCounts([test]);
  return mapped;
}

export async function getPopularTests(
  limit = 4
): Promise<PsychologicalTestDetail[]> {
  const tests = await prisma.test.findMany({
    where: getPublicTestWhere(),
    select: testListSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return mergeSpecialTests(await mapTestsWithCounts(tests)).slice(0, limit);
}

export async function getTestSeoBySlug(slug: string) {
  const test = await prisma.test.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      ...getPublicTestWhere(),
    },
    select: {
      title: true,
      slug: true,
      description: true,
      image: true,
      seoTitle: true,
      seoDescription: true,
      ogImage: true,
      canonicalUrl: true,
      noIndex: true,
    },
  });

  if (!test) return null;

  return resolveSeo(
    {
      title: test.title,
      slug: test.slug,
      description: test.description,
      image: test.image,
      seoTitle: test.seoTitle,
      seoDescription: test.seoDescription,
      ogImage: test.ogImage,
      canonicalUrl: test.canonicalUrl,
      noIndex: test.noIndex,
    },
    {
      titleSuffix: " | Test Merkezi | TürkPDR",
      path: `/test-merkezi/${test.slug}`,
      defaultImage: test.image,
    }
  );
}

export function getTestCategoryFilters() {
  return testCategories;
}

export async function getTestCenterPageData() {
  const [allTests, featuredTest, popularTests, totalParticipants] =
    await Promise.all([
      getAllPublishedTests(),
      getFeaturedTest(),
      getPopularTests(),
      prisma.testResult.count(),
    ]);

  return {
    allTests,
    featuredTest,
    popularTests,
    categories: getTestCategoryFilters(),
    totalParticipants,
    totalTests: allTests.length,
  };
}
