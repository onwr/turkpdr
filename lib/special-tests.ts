import type { PsychologicalTestDetail } from "@/types/test";
import type { SearchResultItem } from "@/types/search";
import { truncateText } from "@/lib/search-utils";

export const REFLEX_TEST_SLUG = "kirmizi-kare-refleks-testi";
export const SCL90_TEST_SLUG = "scl90-r-psikolojik-belirti-taramasi";
export const RIVER_CROSSING_TEST_SLUG = "nehirden-gecirme-zeka-testi";

export const REFLEX_BEST_SCORE_KEY = "turkpdr-reflex-best-score";

export const REFLEX_TEST_ROUTE = `/test-merkezi/${REFLEX_TEST_SLUG}`;
export const SCL90_TEST_ROUTE = `/test-merkezi/${SCL90_TEST_SLUG}`;
export const RIVER_CROSSING_TEST_ROUTE = `/test-merkezi/${RIVER_CROSSING_TEST_SLUG}`;

const SPECIAL_TEST_SEARCH_KEYWORDS: Record<string, string[]> = {
  [REFLEX_TEST_SLUG]: ["refleks", "kırmızı", "kirmizi", "kare"],
  [SCL90_TEST_SLUG]: [
    "scl90",
    "scl-90",
    "scl 90",
    "belirti taraması",
    "belirti taramasi",
    "semptom",
    "psikolojik belirti",
    "belirti",
  ],
  [RIVER_CROSSING_TEST_SLUG]: [
    "nehirden geçirme",
    "nehirden gecirme",
    "zeka testi",
    "japonya testi",
    "sal oyunu",
    "nehirden",
    "sal",
    "bulmaca",
  ],
};

export const SPECIAL_TESTS: PsychologicalTestDetail[] = [
  {
    id: "special-nehirden-gecirme",
    slug: RIVER_CROSSING_TEST_SLUG,
    title: "Nehirden Geçirme Zeka Testi",
    category: "yetişkin",
    categoryLabel: "Zeka",
    description:
      "Kurallara uyarak tüm karakterleri nehrin karşısına geçirmeye çalıştığınız klasik problem çözme oyunu.",
    duration: 8,
    questionCount: 1,
    difficulty: "orta",
    participantCount: 0,
    popular: true,
    isSpecial: true,
    hasOnlineQuestions: false,
  },
  {
    id: "special-scl90r",
    slug: SCL90_TEST_SLUG,
    title: "SCL90-R Psikolojik Belirti Taraması",
    category: "klinik",
    categoryLabel: "Klinik",
    description:
      "Psikolojik belirti düzeylerini değerlendirmeye yardımcı tarama ölçeği. 90 maddelik SCL90-R formu ile alt ölçek ve Genel Semptom İndeksi hesaplanır.",
    duration: 18,
    questionCount: 90,
    difficulty: "orta",
    participantCount: 0,
    popular: true,
    isSpecial: true,
    hasOnlineQuestions: false,
  },
  {
    id: "special-kirmizi-kare-refleks",
    slug: REFLEX_TEST_SLUG,
    title: "Kırmızı Kare Refleks Testi",
    category: "yetişkin",
    categoryLabel: "Beceri",
    description:
      "Dikkatini, refleksini ve odaklanma süreni ölçen kısa bir beceri testi. Kırmızı kareyi fare veya parmakla kontrol ederek mavi engellere çarpmadan ne kadar dayanabileceğini keşfet.",
    duration: 2,
    questionCount: 0,
    difficulty: "orta",
    participantCount: 0,
    popular: true,
    isSpecial: true,
    hasOnlineQuestions: false,
  },
];

function matchesSpecialTestSearch(
  test: PsychologicalTestDetail,
  query: string
): boolean {
  if (test.title.toLowerCase().includes(query)) return true;
  if (test.description.toLowerCase().includes(query)) return true;

  const keywords = SPECIAL_TEST_SEARCH_KEYWORDS[test.slug] ?? [];
  return keywords.some((keyword) => query.includes(keyword));
}

export function getTestStartHref(test: PsychologicalTestDetail): string {
  if (test.isSpecial) {
    return `/test-merkezi/${test.slug}`;
  }

  return test.hasOnlineQuestions
    ? `/test-merkezi/${test.slug}/coz`
    : `/test-merkezi/${test.slug}`;
}

export function mergeSpecialTests(
  tests: PsychologicalTestDetail[]
): PsychologicalTestDetail[] {
  const existingSlugs = new Set(tests.map((test) => test.slug));
  const specials = SPECIAL_TESTS.filter((test) => !existingSlugs.has(test.slug));
  return [...specials, ...tests];
}

export function searchSpecialTests(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return SPECIAL_TESTS.filter((test) => matchesSpecialTestSearch(test, q)).map(
    (test) => ({
      id: test.id,
      title: test.title,
      description: truncateText(test.description),
      typeLabel: "Test",
      url: `/test-merkezi/${test.slug}`,
    })
  );
}

export function getSpecialTestBySlug(
  slug: string
): PsychologicalTestDetail | null {
  return (
    SPECIAL_TESTS.find(
      (test) => test.slug.toLowerCase() === slug.trim().toLowerCase()
    ) ?? null
  );
}
