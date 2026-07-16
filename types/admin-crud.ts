import type { ContentStatus, ContentType } from "@prisma/client";

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  type: ContentType;
  createdAt: string;
  updatedAt: string;
  _count: {
    contents: number;
    tests: number;
  };
};

export type CategoryFormState = {
  name: string;
  type: ContentType;
};

export const defaultCategoryFormState: CategoryFormState = {
  name: "",
  type: "ARTICLE",
};

export type TestListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  duration: string | null;
  questionCount: number | null;
  iframeUrl: string | null;
  status: ContentStatus;
  scheduledAt: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

import { defaultSeoFields, type SeoFieldsForm } from "@/types/seo";

export type TestFormState = {
  title: string;
  description: string;
  image: string;
  duration: string;
  questionCount: string;
  iframeUrl: string;
  status: ContentStatus;
  scheduledAt: string;
  categoryId: string;
  seo: SeoFieldsForm;
};

export const defaultTestFormState: TestFormState = {
  title: "",
  description: "",
  image: "",
  duration: "",
  questionCount: "",
  iframeUrl: "",
  status: "PUBLISHED",
  scheduledAt: "",
  categoryId: "",
  seo: { ...defaultSeoFields },
};
