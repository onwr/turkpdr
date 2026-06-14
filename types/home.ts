export type NavItem = {
  label: string;
  href: string;
};

export type StatItem = {
  id: string;
  label: string;
  value: number;
  icon: "articles" | "tests" | "members" | "files";
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  coverImage: string;
};

export type TestCategory =
  | "cocuk"
  | "ergen"
  | "yetişkin"
  | "meslek"
  | "klinik";

export type TestCategoryFilter = {
  id: TestCategory | "all";
  label: string;
};

export type PsychologicalTest = {
  id: string;
  title: string;
  category: TestCategory;
  duration: number;
  questionCount: number;
  slug: string;
};

export type FileItem = {
  id: string;
  name: string;
  category: string;
  downloadCount: number;
  slug: string;
};

export type Author = {
  id: string;
  name: string;
  title: string;
  articleCount: number;
  avatar: string;
  slug: string;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  coverImage: string;
  featured?: boolean;
};
