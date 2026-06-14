import { prisma } from "@/lib/prisma";
import { getPublicContentWhere } from "@/lib/queries/constants";

export async function getPublishedContentById(id: string) {
  return prisma.content.findFirst({
    where: { id, ...getPublicContentWhere() },
    select: { id: true, title: true, slug: true, authorId: true, type: true },
  });
}
