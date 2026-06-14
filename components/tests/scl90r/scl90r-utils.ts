export const SCL90_ANSWERS_KEY = "turkpdr-scl90r-answers";
export const SCL90_RESULT_KEY = "turkpdr-scl90r-result";

export const SCORE_OPTIONS = [
  { value: 0, label: "Hiç" },
  { value: 1, label: "Çok az" },
  { value: 2, label: "Orta derecede" },
  { value: 3, label: "Oldukça fazla" },
  { value: 4, label: "İleri derecede" },
] as const;

export type ScoreValue = (typeof SCORE_OPTIONS)[number]["value"];

export type Scl90Answers = Record<number, ScoreValue>;

export type SeverityLevel = "low" | "high" | "very-high";

export type SubscaleResult = {
  id: string;
  name: string;
  itemIds: number[];
  score: number;
  severity: SeverityLevel;
};

export type Scl90Result = {
  gsi: number;
  gsiSeverity: SeverityLevel;
  subscales: SubscaleResult[];
  completedAt: string;
  highRiskItems: number[];
};

export const SCL90_QUESTIONS: string[] = [
  "Baş ağrısı",
  "Sinirlilik ya da içinin titremesi",
  "Zihinden atamadığınız tekrarlayan, hoşa gitmeyen düşünceler",
  "Baygınlık ya da baş dönmesi",
  "Cinsel arzu ve ilginin kaybı",
  "Başkaları tarafından eleştirilme duygusu",
  "Herhangi bir kimsenin düşüncelerinizi kontrol edebileceği fikri",
  "Sorunlarınızdan pek çoğu için başkalarının suçlanması gerektiği duygusu",
  "Olayları anımsamada güçlük",
  "Dikkatsizlik ya da sakarlıkla ilgili düşünceler",
  "Kolayca gücenme, rahatsız olma hissi",
  "Göğüs ya da kalp bölgesinde ağrılar",
  "Caddelerde veya açık alanlarda korku hissi",
  "Enerjinizde azalma veya yavaşlama hali",
  "Yaşamınızın sonlanması düşünceleri",
  "Başka kişilerin duymadıkları sesleri duyma",
  "Titreme",
  "Çoğu kişiye güvenilmemesi gerektiği hissi",
  "İştah azalması",
  "Kolayca ağlama",
  "Karşı cinsten kişilerle utangaçlık ve rahatsızlık hissi",
  "Tuzağa düşürülmüş veya yakalanmış olma hissi",
  "Bir neden olmaksızın aniden korkuya kapılma",
  "Kontrol edilemeyen öfke patlamaları",
  "Evden dışarı yalnız çıkma korkusu",
  "Olanlar için kendisini suçlama",
  "Belin alt kısmında ağrılar",
  "İşlerin yapılmasında erteleme duygusu",
  "Yalnızlık hissi",
  "Karamsarlık hissi",
  "Her şey için çok fazla endişe duyma",
  "Her şeye karşı ilgisizlik hali",
  "Korku hissi",
  "Duygularınızın kolayca incitilebilmesi hali",
  "Diğer insanların sizin özel düşüncelerinizi bilmesi",
  "Başkalarının sizi anlamadığı veya hissedemeyeceği duygusu",
  "Başkalarının sizi sevmediği ya da dostça olmayan davranışlar gösterdiği hissi",
  "İşlerin doğru yapıldığından emin olmak için çok yavaş yapmak",
  "Kalbin çok hızlı çarpması",
  "Bulantı ve midede rahatsızlık hissi",
  "Kendini başkalarından aşağı görme",
  "Adale, kas ağrıları",
  "Başkalarının sizi gözlediği veya hakkınızda konuştuğu hissi",
  "Uykuya dalmada güçlük",
  "Yaptığınız işleri bir ya da birkaç kez kontrol etme",
  "Karar vermede güçlük",
  "Otobüs, tren, metro gibi araçlarla yolculuk etme korkusu",
  "Nefes almada güçlük",
  "Soğuk veya sıcak basması",
  "Sizi korkutan belirli uğraş, yer veya nesnelerden kaçınma durumu",
  "Hiçbir şey düşünmeme hali",
  "Bedeninizin bazı kısımlarında uyuşma, karıncalanma olması",
  "Boğazınıza bir yumru takınmış hissi",
  "Gelecek konusunda ümitsizlik",
  "Düşüncelerinizi bir konuya yoğunlaştırmada güçlük",
  "Bedeninizin çeşitli kısımlarında zayıflık hissi",
  "Gerginlik veya coşku hissi",
  "Kol ve bacaklarda ağırlık hissi",
  "Ölüm ya da ölme düşünceleri",
  "Aşırı yemek yeme",
  "İnsanlar size baktığı veya hakkınızda konuştuğu zaman rahatsızlık duyma",
  "Size ait olmayan düşüncelere sahip olma",
  "Bir başkasına vurmak, zarar vermek, yaralamak dürtülerinin olması",
  "Sabahın erken saatlerinde uyanma",
  "Yıkanma, sayma, dokunma gibi bazı hareketleri yineleme hali",
  "Uykuda huzursuzluk, rahat uyuyamama",
  "Bazı şeyleri kırıp dökme hissi",
  "Başkalarının paylaşıp kabul etmediği inanç ve düşüncelerin olması",
  "Başkalarının yanında kendini çok sıkılgan hissetme",
  "Çarşı, sinema gibi kalabalık yerlerde rahatsızlık hissi",
  "Her şeyin bir yük gibi görünmesi",
  "Dehşet ve panik nöbetleri",
  "Toplum içinde yer içerken huzursuzluk hissi",
  "Sık sık tartışmaya girme",
  "Yalnız bırakıldığınızda sinirlilik hali",
  "Başkalarının sizi başarılarınız için yeterince takdir etmediği duygusu",
  "Başkalarıyla birlikte olunan durumlarda bile yalnızlık hissetme",
  "Yerinizde duramayacak ölçüde rahatsızlık hissetme",
  "Değersizlik duygusu",
  "Size kötü bir şey olacakmış hissi",
  "Bağırma ya da eşyaları fırlatma",
  "Topluluk içinde bayılacağınız korkusu",
  "Eğer izin verirseniz insanların sizi sömüreceği duygusu",
  "Cinsiyet konusunda sizi çok rahatsız eden düşüncelerin olması",
  "Günahlarınızdan dolayı cezalandırılmanız gerektiği düşüncesi",
  "Korkutucu türden düşünce ve hayaller",
  "Bedeninizde ciddi bir rahatsızlık olduğu düşüncesi",
  "Başka bir kişiye karşı asla yakınlık duymama",
  "Suçluluk duygusu",
  "Aklınızda bir bozukluğun olduğu düşüncesi",
];

export const SCL90_SUBSCALES: {
  id: string;
  name: string;
  itemIds: number[];
}[] = [
  {
    id: "somatization",
    name: "Somatizasyon",
    itemIds: [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58],
  },
  {
    id: "obsessive-compulsive",
    name: "Obsesif Kompulsif",
    itemIds: [3, 9, 10, 28, 38, 45, 46, 51, 55, 65],
  },
  {
    id: "interpersonal-sensitivity",
    name: "Kişilerarası Duyarlılık",
    itemIds: [6, 21, 34, 36, 37, 41, 61, 69, 73],
  },
  {
    id: "depression",
    name: "Depresyon",
    itemIds: [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79],
  },
  {
    id: "anxiety",
    name: "Anksiyete",
    itemIds: [2, 17, 23, 33, 39, 57, 72, 78, 80, 86],
  },
  {
    id: "hostility",
    name: "Öfke / Hostilite",
    itemIds: [11, 24, 63, 67, 74, 81],
  },
  {
    id: "phobic-anxiety",
    name: "Fobik Anksiyete",
    itemIds: [13, 25, 47, 50, 70, 75, 82],
  },
  {
    id: "paranoid",
    name: "Paranoid Düşünce",
    itemIds: [8, 18, 43, 68, 76, 83],
  },
  {
    id: "psychoticism",
    name: "Psikotizm",
    itemIds: [7, 16, 35, 62, 77, 84, 85, 87, 88, 90],
  },
  {
    id: "additional",
    name: "Ek Belirtiler",
    itemIds: [19, 44, 59, 60, 64, 66, 89],
  },
];

export const HIGH_RISK_ITEM_IDS = [15, 59, 63, 80, 86];

export function getSeverityLevel(score: number): SeverityLevel {
  if (score >= 2) return "very-high";
  if (score >= 1) return "high";
  return "low";
}

export function getSeverityLabel(severity: SeverityLevel): string {
  switch (severity) {
    case "very-high":
      return "Çok yüksek";
    case "high":
      return "Yüksek";
    default:
      return "Normal / Düşük";
  }
}

export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case "very-high":
      return "bg-rose-500";
    case "high":
      return "bg-amber-500";
    default:
      return "bg-emerald-500";
  }
}

export function calculateSubscaleScore(
  answers: Scl90Answers,
  itemIds: number[]
): number {
  const values = itemIds
    .map((id) => answers[id])
    .filter((v): v is ScoreValue => v !== undefined);
  if (values.length === 0) return 0;
  const total = values.reduce<number>((sum, v) => sum + v, 0);
  return total / values.length;
}

export function calculateScl90Result(answers: Scl90Answers): Scl90Result {
  const allValues = Array.from({ length: 90 }, (_, i) => answers[i + 1] ?? 0);
  const gsi = allValues.reduce<number>((sum, v) => sum + v, 0) / 90;

  const subscales: SubscaleResult[] = SCL90_SUBSCALES.map((scale) => {
    const score = calculateSubscaleScore(answers, scale.itemIds);
    return {
      ...scale,
      score,
      severity: getSeverityLevel(score),
    };
  });

  const highRiskItems = HIGH_RISK_ITEM_IDS.filter(
    (id) => (answers[id] ?? 0) >= 3
  );

  return {
    gsi,
    gsiSeverity: getSeverityLevel(gsi),
    subscales,
    completedAt: new Date().toISOString(),
    highRiskItems,
  };
}

export function countAnswered(answers: Scl90Answers): number {
  return Object.keys(answers).filter(
    (key) => answers[Number(key)] !== undefined
  ).length;
}

export function getMissingCount(answers: Scl90Answers): number {
  return 90 - countAnswered(answers);
}

export function isComplete(answers: Scl90Answers): boolean {
  return getMissingCount(answers) === 0;
}

export function loadAnswers(): Scl90Answers {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SCL90_ANSWERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Scl90Answers;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAnswers(answers: Scl90Answers) {
  window.localStorage.setItem(SCL90_ANSWERS_KEY, JSON.stringify(answers));
}

export function loadResult(): Scl90Result | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SCL90_RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Scl90Result;
  } catch {
    return null;
  }
}

export function saveResult(result: Scl90Result) {
  window.localStorage.setItem(SCL90_RESULT_KEY, JSON.stringify(result));
}

export function clearScl90Storage() {
  window.localStorage.removeItem(SCL90_ANSWERS_KEY);
  window.localStorage.removeItem(SCL90_RESULT_KEY);
}
