import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveSeo } from "@/lib/seo/metadata";
import type {
  PublicDictionaryDetail,
  PublicDictionaryTerm,
} from "@/types/dictionary";

import { getPublicDictionaryWhere } from "@/lib/queries/constants";

function getFirstLetter(title: string): string {
  const char = title.trim().charAt(0).toLocaleUpperCase("tr-TR");
  if (/[A-ZÇĞİÖŞÜ]/.test(char)) return char;
  return "#";
}

export async function getDictionaryCategories(): Promise<string[]> {
  const terms = await prisma.dictionaryTerm.findMany({
    where: {
      ...getPublicDictionaryWhere(),
      category: { not: null },
    },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return terms
    .map((t) => t.category)
    .filter((c): c is string => !!c);
}

export async function getPublishedDictionaryTerms(
  search?: string,
  category?: string
): Promise<PublicDictionaryTerm[]> {
  const where: Prisma.DictionaryTermWhereInput = {
    ...getPublicDictionaryWhere(),
  };

  if (search?.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { shortDescription: { contains: search.trim(), mode: "insensitive" } },
      { content: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  if (category?.trim()) {
    where.category = { equals: category.trim(), mode: "insensitive" };
  }

  const terms = await prisma.dictionaryTerm.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      category: true,
      views: true,
    },
    orderBy: { title: "asc" },
  });

  return terms;
}

export function groupTermsByLetter(
  terms: PublicDictionaryTerm[]
): { letter: string; terms: PublicDictionaryTerm[] }[] {
  const groups = new Map<string, PublicDictionaryTerm[]>();

  for (const term of terms) {
    const letter = getFirstLetter(term.title);
    const list = groups.get(letter) ?? [];
    list.push(term);
    groups.set(letter, list);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b, "tr");
    })
    .map(([letter, groupTerms]) => ({ letter, terms: groupTerms }));
}

export async function getDictionaryPageData(
  search?: string,
  category?: string
) {
  const [terms, categories] = await Promise.all([
    getPublishedDictionaryTerms(search, category),
    getDictionaryCategories(),
  ]);

  return {
    terms,
    groups: groupTermsByLetter(terms),
    categories,
  };
}

export async function getDictionaryTermBySlug(
  slug: string
): Promise<PublicDictionaryDetail | null> {
  const term = await prisma.dictionaryTerm.findFirst({
    where: { slug, ...getPublicDictionaryWhere() },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      content: true,
      category: true,
      views: true,
      updatedAt: true,
      seoTitle: true,
      seoDescription: true,
      ogImage: true,
      canonicalUrl: true,
      noIndex: true,
    },
  });

  if (!term) return null;

  return {
    ...term,
    updatedAt: term.updatedAt.toISOString(),
  };
}

export async function getDictionarySeoBySlug(slug: string) {
  const term = await prisma.dictionaryTerm.findFirst({
    where: { slug, ...getPublicDictionaryWhere() },
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      ogImage: true,
      canonicalUrl: true,
      noIndex: true,
      category: true,
    },
  });

  if (!term) return null;

  return resolveSeo(
    {
      title: term.title,
      slug: term.slug,
      shortDescription: term.shortDescription,
      seoTitle: term.seoTitle,
      seoDescription: term.seoDescription,
      ogImage: term.ogImage,
      canonicalUrl: term.canonicalUrl,
      noIndex: term.noIndex,
    },
    {
      titleSuffix: " — PDR Sözlüğü | TürkPDR",
      path: `/sozluk/${term.slug}`,
      descriptionFallback: `${term.title} teriminin tanımı ve açıklaması. TürkPDR PDR Sözlüğü.`,
    }
  );
}

export async function incrementDictionaryViews(id: string) {
  return prisma.dictionaryTerm.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getSimilarDictionaryTerms(
  termId: string,
  category: string | null,
  limit = 4
): Promise<PublicDictionaryTerm[]> {
  const where: Prisma.DictionaryTermWhereInput = {
    ...getPublicDictionaryWhere(),
    NOT: { id: termId },
    ...(category ? { category } : {}),
  };

  return prisma.dictionaryTerm.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      category: true,
      views: true,
    },
    orderBy: { views: "desc" },
    take: limit,
  });
}

export async function getPublishedDictionarySlugs() {
  const terms = await prisma.dictionaryTerm.findMany({
    where: getPublicDictionaryWhere(),
    select: { slug: true },
  });
  return terms.map((t) => t.slug);
}
