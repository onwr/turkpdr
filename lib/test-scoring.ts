export type TestScoreInterpretation = {
  resultLabel: string;
  resultDescription: string;
};

export function calculateMaxScore(
  questions: { options: { score: number }[] }[]
): number {
  return questions.reduce((sum, question) => {
    const maxOption = question.options.reduce(
      (max, option) => Math.max(max, option.score),
      0
    );
    return sum + maxOption;
  }, 0);
}

export function interpretTestScore(
  totalScore: number,
  maxScore: number
): TestScoreInterpretation {
  if (maxScore <= 0) {
    return {
      resultLabel: "Tamamlandı",
      resultDescription:
        "Test tamamlandı. Bu test için puanlama aralığı henüz tanımlanmamış.",
    };
  }

  const percent = (totalScore / maxScore) * 100;

  if (percent <= 33) {
    return {
      resultLabel: "Düşük Düzey",
      resultDescription:
        "Yanıtlarınız düşük düzeyde bir profil göstermektedir. Bu sonuç yalnızca bilgilendirme amaçlıdır; profesyonel değerlendirme yerine geçmez.",
    };
  }

  if (percent <= 66) {
    return {
      resultLabel: "Orta Düzey",
      resultDescription:
        "Yanıtlarınız orta düzeyde bir profil göstermektedir. Günlük yaşamınızda fark ettiğiniz durumları göz önünde bulundurarak uzman desteği almayı düşünebilirsiniz.",
    };
  }

  return {
    resultLabel: "Yüksek Düzey",
    resultDescription:
      "Yanıtlarınız yüksek düzeyde bir profil göstermektedir. Bu sonuç tanı koymaz; ihtiyaç duyarsanız bir ruh sağlığı uzmanına başvurmanız önerilir.",
  };
}
