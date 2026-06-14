import type {
  PsychologicalTestDetail,
  TestCategoryFilter,
  TestFaqItem,
  TestInfoItem,
} from "@/types/test";

export const testCategories: TestCategoryFilter[] = [
  { id: "all", label: "Tümü" },
  { id: "cocuk", label: "Çocuk" },
  { id: "ergen", label: "Ergen" },
  { id: "yetişkin", label: "Yetişkin" },
  { id: "meslek", label: "Meslek" },
  { id: "klinik", label: "Klinik" },
];

export const categoryLabels: Record<string, string> = {
  cocuk: "Çocuk",
  ergen: "Ergen",
  yetişkin: "Yetişkin",
  meslek: "Meslek",
  klinik: "Klinik",
};

export const psychologicalTests: PsychologicalTestDetail[] = [
  {
    id: "1",
    slug: "beck-depresyon",
    title: "Beck Depresyon Testi",
    category: "klinik",
    categoryLabel: "Klinik",
    description:
      "Depresyon belirtilerinin şiddetini ölçmek için kullanılan, dünya genelinde en yaygın klinik değerlendirme ölçeklerinden biridir.",
    duration: 10,
    questionCount: 21,
    difficulty: "orta",
    participantCount: 12450,
    featured: true,
    popular: true,
  },
  {
    id: "2",
    slug: "kaygi-testi",
    title: "Kaygı Testi",
    category: "yetişkin",
    categoryLabel: "Yetişkin",
    description:
      "Genel kaygı düzeyinizi değerlendirmenize yardımcı olan, günlük yaşamda hissettiğiniz endişe ve gerginliği ölçen kapsamlı bir testtir.",
    duration: 8,
    questionCount: 20,
    difficulty: "kolay",
    participantCount: 9820,
    popular: true,
  },
  {
    id: "3",
    slug: "ozguven-testi",
    title: "Özgüven Testi",
    category: "ergen",
    categoryLabel: "Ergen",
    description:
      "Ergenlerin özgüven düzeylerini değerlendirmek için tasarlanmış, benlik algısı ve sosyal güven boyutlarını ölçen bir ölçektir.",
    duration: 12,
    questionCount: 25,
    difficulty: "kolay",
    participantCount: 7650,
    popular: true,
  },
  {
    id: "4",
    slug: "mesleki-yonelim",
    title: "Mesleki Yönelim Testi",
    category: "meslek",
    categoryLabel: "Meslek",
    description:
      "İlgi alanlarınızı, yeteneklerinizi ve kişilik özelliklerinizi analiz ederek size en uygun meslek alanlarını öneren kapsamlı bir testtir.",
    duration: 15,
    questionCount: 30,
    difficulty: "orta",
    participantCount: 11200,
    popular: true,
  },
  {
    id: "5",
    slug: "cocuk-davranis",
    title: "Çocuk Davranış Değerlendirme",
    category: "cocuk",
    categoryLabel: "Çocuk",
    description:
      "6-12 yaş arası çocukların davranışsal ve duygusal gelişimini değerlendirmek için ebeveyn ve öğretmenlere yönelik bir ölçektir.",
    duration: 10,
    questionCount: 18,
    difficulty: "kolay",
    participantCount: 5430,
  },
  {
    id: "6",
    slug: "stres-olcegi",
    title: "Stres Düzeyi Ölçeği",
    category: "klinik",
    categoryLabel: "Klinik",
    description:
      "Günlük yaşamda karşılaşılan stres faktörlerini ve stres düzeyinizi ölçen, klinik ve akademik çalışmalarda yaygın kullanılan bir ölçektir.",
    duration: 7,
    questionCount: 14,
    difficulty: "kolay",
    participantCount: 6780,
  },
  {
    id: "7",
    slug: "sosyal-kaygi",
    title: "Sosyal Kaygı Ölçeği",
    category: "ergen",
    categoryLabel: "Ergen",
    description:
      "Sosyal ortamlarda yaşanan kaygı ve çekingenlik düzeyini değerlendiren, ergenler için özelleştirilmiş bir testtir.",
    duration: 9,
    questionCount: 16,
    difficulty: "orta",
    participantCount: 4320,
  },
  {
    id: "8",
    slug: "dikkat-eksikligi",
    title: "Dikkat Eksikliği Tarama Testi",
    category: "cocuk",
    categoryLabel: "Çocuk",
    description:
      "Çocuklarda dikkat eksikliği ve hiperaktivite belirtilerini taramak için kullanılan ön değerlendirme aracıdır.",
    duration: 8,
    questionCount: 22,
    difficulty: "orta",
    participantCount: 3890,
  },
];

export const testInfoItems: TestInfoItem[] = [
  {
    id: "1",
    title: "Bilimsel Geçerlilik",
    description:
      "Tüm testlerimiz literatürde geçerliliği kanıtlanmış ölçeklere dayanmaktadır ve uzman psikologlar tarafından uyarlanmıştır.",
    icon: "shield",
  },
  {
    id: "2",
    title: "Anında Sonuç",
    description:
      "Testleri tamamladığınızda sonuçlarınız anında hesaplanır ve detaylı bir rapor sunulur.",
    icon: "chart",
  },
  {
    id: "3",
    title: "Uzman Desteği",
    description:
      "Sonuçlarınız hakkında sorularınız için platformumuzdaki uzman psikologlara danışabilirsiniz.",
    icon: "users",
  },
  {
    id: "4",
    title: "Hızlı ve Kolay",
    description:
      "Testler ortalama 7-15 dakika sürer ve herhangi bir cihazdan erişilebilir.",
    icon: "clock",
  },
];

export const testFaqItems: TestFaqItem[] = [
  {
    id: "1",
    question: "Testler ücretsiz mi?",
    answer:
      "Evet, TürkPDR Test Merkezi'ndeki tüm testler ücretsizdir. Üye olarak sınırsız test çözebilir ve sonuçlarınızı kaydedebilirsiniz.",
  },
  {
    id: "2",
    question: "Test sonuçları ne kadar güvenilir?",
    answer:
      "Testlerimiz bilimsel literatürde geçerliliği kanıtlanmış ölçeklere dayanmaktadır. Ancak online testler ön değerlendirme amaçlıdır ve profesyonel tanı yerine geçmez.",
  },
  {
    id: "3",
    question: "Sonuçlarımı paylaşabilir miyim?",
    answer:
      "Evet, test sonuçlarınızı PDF olarak indirebilir veya rehber öğretmeniniz ve psikolojik danışmanınızla paylaşabilirsiniz.",
  },
  {
    id: "4",
    question: "Testleri tekrar çözebilir miyim?",
    answer:
      "Evet, istediğiniz zaman testleri tekrar çözebilirsiniz. Önceki sonuçlarınız profilinizde saklanır ve gelişiminizi takip edebilirsiniz.",
  },
  {
    id: "5",
    question: "Çocuğum için test yaptırabilir miyim?",
    answer:
      "Çocuk kategorisindeki testler ebeveyn veya öğretmen gözlemlerine dayalıdır. Sonuçları bir uzmanla değerlendirmenizi öneririz.",
  },
];

export function getFeaturedTest(): PsychologicalTestDetail | undefined {
  return psychologicalTests.find((t) => t.featured);
}

export function getPopularTests(limit = 4): PsychologicalTestDetail[] {
  return psychologicalTests.filter((t) => t.popular).slice(0, limit);
}
