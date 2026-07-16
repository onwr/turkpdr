import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/seo/metadata";
import { getPublishedContentSlugs, getPublishedNewsSlugs } from "@/lib/queries/articles";
import { getPublishedDictionarySlugs } from "@/lib/queries/dictionary";
import { getAuthorProfileIds } from "@/lib/queries/profile";
import { getPublishedPsikoSanatSlugs } from "@/lib/queries/psiko-sanat";
import { getPublishedTestSlugs } from "@/lib/queries/tests";
import { getPublishedVideoSlugs } from "@/lib/queries/videos";
import { SPECIAL_TESTS } from "@/lib/special-tests";

const STATIC_ROUTES = [
  "",
  "/hakkimizda",
  "/iletisim",
  "/gizlilik-politikasi",
  "/kvkk",
  "/makaleler",
  "/haberler",
  "/psiko-sanat",
  "/sozluk",
  "/test-merkezi",
  "/dosyalar",
  "/videolar",
  "/yazarlar",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();

  const [
    articleSlugs,
    newsSlugs,
    dictionarySlugs,
    psikoSanatSlugs,
    testSlugs,
    videoSlugs,
    authorIds,
  ] = await Promise.all([
    getPublishedContentSlugs().catch(() => []),
    getPublishedNewsSlugs().catch(() => []),
    getPublishedDictionarySlugs().catch(() => []),
    getPublishedPsikoSanatSlugs().catch(() => []),
    getPublishedTestSlugs().catch(() => []),
    getPublishedVideoSlugs().catch(() => []),
    getAuthorProfileIds().catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const toEntries = (prefix: string, slugs: string[]): MetadataRoute.Sitemap =>
    slugs.map((slug) => ({
      url: `${baseUrl}${prefix}/${slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  // Hardcoded special tests (e.g. SCL-90) aren't in the DB, so they're never
  // covered by getPublishedTestSlugs — list their static routes explicitly.
  const specialTestEntries: MetadataRoute.Sitemap = SPECIAL_TESTS.map(
    (test) => ({
      url: `${baseUrl}/test-merkezi/${test.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [
    ...staticEntries,
    ...toEntries("/makaleler", articleSlugs),
    ...toEntries("/haberler", newsSlugs),
    ...toEntries("/sozluk", dictionarySlugs),
    ...toEntries("/psiko-sanat", psikoSanatSlugs),
    ...toEntries("/test-merkezi", testSlugs),
    ...specialTestEntries,
    ...toEntries("/videolar", videoSlugs),
    ...toEntries("/profil", authorIds),
  ];
}
