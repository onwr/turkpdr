export type TestCategory =
  | "cocuk"
  | "ergen"
  | "yetişkin"
  | "meslek"
  | "klinik";

export type TestCategoryFilter = {
  id: TestCategory | "all";
  label: string;
};

export type TestDifficulty = "kolay" | "orta" | "zor";

export type PsychologicalTestDetail = {
  id: string;
  slug: string;
  title: string;
  category: TestCategory;
  categoryLabel: string;
  description: string;
  duration: number;
  questionCount: number;
  difficulty: TestDifficulty;
  participantCount: number;
  featured?: boolean;
  popular?: boolean;
  image?: string | null;
  iframeUrl?: string | null;
  hasOnlineQuestions?: boolean;
  isSpecial?: boolean;
};

export type TestFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type TestInfoItem = {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "chart" | "users" | "clock";
};
