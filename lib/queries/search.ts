import type { ContentType } from "@prisma/client";

import { getContentViewUrl } from "@/lib/admin/content-display";
import { prisma } from "@/lib/prisma";
import {
  getPublicContentWhere,
  getPublicFileWhere,
  getPublicTestWhere,
} from "@/lib/queries/constants";
import { searchSpecialTests } from "@/lib/special-tests";
import { stripHtml, truncateText } from "@/lib/search-utils";
import { contentTypeLabels } from "@/types/content";
import {
  SEARCH_MAX_RESULTS,
  SEARCHABLE_CONTENT_TYPES,
  type SearchResponse,
  type SearchResultItem,
} from "@/types/search";

function mapContent(item: {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  summary: string | null;
  content: string | null;
}): SearchResultItem | null {
  const url = getContentViewUrl(item.type, item.slug);
  if (!url) return null;

  const description =
    truncateText(item.summary) ??
    truncateText(stripHtml(item.content));

  return {
    id: item.id,
    title: item.title,
    description,
    typeLabel: contentTypeLabels[item.type],
    url,
  };
}

function mapFile(item: {
  id: string;
  title: string;
  description: string | null;
  fileType: string | null;
}): SearchResultItem {
  return {
    id: item.id,
    title: item.title,
    description: truncateText(item.description),
    typeLabel: item.fileType ?? "Dosya",
    url: `/api/files/${item.id}/download`,
  };
}

function mapTest(item: {
  id: string;
  title: string;
  description: string | null;
  slug: string;
}): SearchResultItem {
  return {
    id: item.id,
    title: item.title,
    description: truncateText(item.description),
    typeLabel: "Test",
    url: `/test-merkezi/${item.slug}`,
  };
}

function mapUser(item: {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
}): SearchResultItem {
  const description =
    truncateText(
      [item.title, item.bio].filter(Boolean).join(" · ")
    ) ?? null;

  return {
    id: item.id,
    title: item.name,
    description,
    typeLabel: "Yazar",
    url: `/profil/${item.id}`,
  };
}

export function emptySearchResponse(query = ""): SearchResponse {
  return {
    query,
    contents: [],
    files: [],
    tests: [],
    users: [],
  };
}

export async function searchSite(query: string): Promise<SearchResponse> {
  const q = query.trim();

  if (!q) {
    return emptySearchResponse();
  }

  const searchFilter = { contains: q, mode: "insensitive" as const };

  const [contentsRaw, filesRaw, testsRaw, usersRaw] = await Promise.all([
    prisma.content.findMany({
      where: {
        type: { in: SEARCHABLE_CONTENT_TYPES },
        AND: [
          getPublicContentWhere(),
          {
            OR: [
              { title: searchFilter },
              { summary: searchFilter },
              { content: searchFilter },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        summary: true,
        content: true,
      },
      orderBy: { publishedAt: "desc" },
      take: SEARCH_MAX_RESULTS,
    }),
    prisma.fileAsset.findMany({
      where: {
        ...getPublicFileWhere(),
        OR: [
          { title: searchFilter },
          { description: searchFilter },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileType: true,
      },
      orderBy: { downloads: "desc" },
      take: SEARCH_MAX_RESULTS,
    }),
    prisma.test.findMany({
      where: {
        AND: [
          getPublicTestWhere(),
          {
            OR: [
              { title: searchFilter },
              { description: searchFilter },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
      },
      orderBy: { createdAt: "desc" },
      take: SEARCH_MAX_RESULTS,
    }),
    prisma.user.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: searchFilter },
          { title: searchFilter },
          { bio: searchFilter },
        ],
      },
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
      },
      orderBy: { name: "asc" },
      take: SEARCH_MAX_RESULTS,
    }),
  ]);

  const contents = contentsRaw
    .map(mapContent)
    .filter((item): item is SearchResultItem => item !== null);

  return {
    query: q,
    contents,
    files: filesRaw.map(mapFile),
    tests: (() => {
      const specialResults = searchSpecialTests(q);
      const specialUrls = new Set(specialResults.map((item) => item.url));
      const dbTests = testsRaw
        .map(mapTest)
        .filter((item) => !specialUrls.has(item.url));
      return [...specialResults, ...dbTests].slice(0, SEARCH_MAX_RESULTS);
    })(),
    users: usersRaw.map(mapUser),
  };
}
