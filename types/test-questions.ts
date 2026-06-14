export type TestOptionInput = {
  id?: string;
  text: string;
  score: number;
  sortOrder: number;
};

export type TestQuestionInput = {
  id?: string;
  text: string;
  sortOrder: number;
  options: TestOptionInput[];
};

export type PublicTestOption = {
  id: string;
  text: string;
};

export type PublicTestQuestion = {
  id: string;
  text: string;
  sortOrder: number;
  options: PublicTestOption[];
};

export type TestSubmitAnswer = Record<string, string>;

export type TestSubmitResult = {
  totalScore: number;
  maxScore: number;
  resultLabel: string;
  resultDescription: string;
  resultId: string | null;
  testTitle: string;
  testSlug: string;
};
