export type ArticleAuthor = {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  slug: string;
  articleCount: number;
};

export type ArticleDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: ArticleAuthor;
  date: string;
  publishedAt: string;
  readTime: number;
  coverImage: string;
  content: string;
  likeCount: number;
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
  canonicalUrl: string;
  noIndex: boolean;
  tags: string[];
};

export type RelatedArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  readTime: number;
};

export type ArticleComment = {
  id: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
};

export type PopularArticle = {
  id: string;
  slug: string;
  title: string;
  readCount: number;
};

export type ArticleCategory = {
  slug: string;
  label: string;
  count: number;
};
