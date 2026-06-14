import { prisma } from "@/lib/prisma";
import { getPublicContentWhere } from "@/lib/queries/constants";

export type ArticleInteractionState = {
  liked: boolean;
  favorited: boolean;
};

export async function getArticleInteractionState(
  contentId: string,
  userId?: string
): Promise<ArticleInteractionState> {
  if (!userId) {
    return { liked: false, favorited: false };
  }

  const [like, favorite] = await Promise.all([
    prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId: contentId },
      },
      select: { id: true },
    }),
    prisma.favorite.findUnique({
      where: {
        userId_postId: { userId, postId: contentId },
      },
      select: { id: true },
    }),
  ]);

  return {
    liked: !!like,
    favorited: !!favorite,
  };
}

export async function getArticleLikeCount(contentId: string): Promise<number> {
  return prisma.like.count({ where: { postId: contentId } });
}

export async function getPublishedContentIdBySlug(
  slug: string
): Promise<string | null> {
  const content = await prisma.content.findFirst({
    where: { slug, ...getPublicContentWhere() },
    select: { id: true },
  });
  return content?.id ?? null;
}
