import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/admin/content-utils";

type SlugModel = "category" | "test";

async function slugExists(
  model: SlugModel,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  if (model === "category") {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return !!existing;
  }

  const existing = await prisma.test.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return !!existing;
}

export async function generateUniqueModelSlug(
  text: string,
  model: SlugModel,
  excludeId?: string
): Promise<string> {
  const base = createSlug(text) || (model === "category" ? "kategori" : "test");
  let slug = base;
  let counter = 2;

  while (await slugExists(model, slug, excludeId)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}
