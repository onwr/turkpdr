import type { ContentType } from "@prisma/client";

export type SearchResultItem = {
  id: string;
  title: string;
  description: string | null;
  typeLabel: string;
  url: string;
};

export type SearchResponse = {
  query: string;
  contents: SearchResultItem[];
  files: SearchResultItem[];
  tests: SearchResultItem[];
  users: SearchResultItem[];
};

export const SEARCHABLE_CONTENT_TYPES: ContentType[] = [
  "NEWS",
  "ARTICLE",
  "GUIDE",
  "METAPHOR",
  "PSIKO_SANAT",
];

export const SEARCH_MAX_RESULTS = 6;
