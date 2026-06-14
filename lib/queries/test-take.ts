import { prisma } from "@/lib/prisma";
import { getPublicTestWhere } from "@/lib/queries/constants";
import type { PublicTestQuestion } from "@/types/test-questions";

export type TestTakePageData = {
  test: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    questionCount: number;
  };
  questions: PublicTestQuestion[];
};

export async function getTestTakePageData(
  slug: string
): Promise<TestTakePageData | null> {
  const test = await prisma.test.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      ...getPublicTestWhere(),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      questions: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          text: true,
          sortOrder: true,
          options: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  if (!test || test.questions.length === 0) {
    return null;
  }

  return {
    test: {
      id: test.id,
      title: test.title,
      slug: test.slug,
      description: test.description,
      questionCount: test.questions.length,
    },
    questions: test.questions,
  };
}
