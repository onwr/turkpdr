import type { DictionaryStatus } from "@prisma/client";

export type DictionaryListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  category: string | null;
  status: DictionaryStatus;
  views: number;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

import { defaultSeoFields, type SeoFieldsForm } from "@/types/seo";

export type DictionaryFormState = {
  title: string;
  shortDescription: string;
  content: string;
  category: string;
  status: DictionaryStatus;
  scheduledAt: string;
  seo: SeoFieldsForm;
};

export const defaultDictionaryFormState: DictionaryFormState = {
  title: "",
  shortDescription: "",
  content: "",
  category: "",
  status: "DRAFT",
  scheduledAt: "",
  seo: { ...defaultSeoFields },
};

export type PublicDictionaryTerm = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  category: string | null;
  views: number;
};

export type PublicDictionaryDetail = PublicDictionaryTerm & {
  content: string | null;
  updatedAt: string;
};

export const dictionaryStatusLabels: Record<DictionaryStatus, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
};

export const DICTIONARY_CATEGORIES = [
  "Genel",
  "Klinik Psikoloji",
  "Eğitim Psikolojisi",
  "Rehberlik",
  "Terapi",
  "Gelişim",
  "Ölçme ve Değerlendirme",
] as const;
