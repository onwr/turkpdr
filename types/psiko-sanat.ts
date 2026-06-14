export const PSIKO_SANAT_CATEGORIES = [
  { name: "Kitap", slug: "kitap" },
  { name: "Film", slug: "film" },
  { name: "Sanat", slug: "sanat" },
  { name: "Psikoloji", slug: "psikoloji" },
] as const;

export type PsikoSanatCategorySlug =
  (typeof PSIKO_SANAT_CATEGORIES)[number]["slug"];
