import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RULES = [
  "Herkes nehrin karşı tarafına geçmelidir.",
  "Sal bir seferde en fazla 2 kişi taşıyabilir.",
  "Salı yalnızca Anne, Baba ve Polis kullanabilir.",
  "Baba, Anne olmadan kız çocuklarıyla aynı kıyıda kalamaz.",
  "Anne, Baba olmadan erkek çocuklarıyla aynı kıyıda kalamaz.",
  "Hırsız, Polis olmadan aile bireyleriyle aynı kıyıda kalamaz.",
  "Kurala aykırı hamleler engellenir ve uyarı gösterilir.",
];

export function RiverCrossingRules() {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="text-lg text-brand-navy">Kurallar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Japonya&apos;da iş başvurularında zeka ve problem çözme testi olarak
          kullanıldığı söylenen klasik nehirden geçirme bulmacası. Tüm
          karakterleri kurallara uyarak sağ kıyıya geçirin.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
