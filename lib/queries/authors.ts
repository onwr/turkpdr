import { prisma } from "@/lib/prisma";
import { DEFAULT_AVATAR, getPublicContentWhere } from "@/lib/queries/constants";
import { resolveMediaUrlWithFallback } from "@/lib/media-url";
import type { Author } from "@/types/home";

export async function getPublishedAuthors(limit = 48): Promise<Author[]> {
  const authors = await prisma.user.findMany({
    where: {
      role: { in: ["AUTHOR", "EDITOR", "ADMIN"] },
      status: "ACTIVE",
      contents: {
        some: {
          ...getPublicContentWhere(),
        },
      },
    },
    select: {
      id: true,
      name: true,
      title: true,
      avatar: true,
      bio: true,
      _count: {
        select: {
          contents: {
            where: getPublicContentWhere(),
          },
        },
      },
    },
    orderBy: {
      contents: { _count: "desc" },
    },
    take: limit,
  });

  return authors.map((author) => ({
    id: author.id,
    name: author.name,
    title: author.title ?? "Yazar",
    articleCount: author._count.contents,
    avatar: resolveMediaUrlWithFallback(author.avatar, DEFAULT_AVATAR),
    slug: author.id,
  }));
}
