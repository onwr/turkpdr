import { BarChart3, Clock, Shield, Users } from "lucide-react";

import { testInfoItems } from "@/lib/mock-data/tests";

const iconMap = {
  shield: Shield,
  chart: BarChart3,
  users: Users,
  clock: Clock,
} as const;

export function TestInfoSection() {
  return (
    <section
      aria-labelledby="test-info-heading"
      className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm sm:p-10"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="test-info-heading"
          className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl"
        >
          Testler Hakkında
        </h2>
        <p className="mt-3 text-muted-foreground">
          TürkPDR Test Merkezi, bilimsel geçerliliği kanıtlanmış ölçekleri
          dijital ortama taşıyarak herkesin erişimine sunar.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {testInfoItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-brand-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
        Online testler ön değerlendirme amaçlıdır ve profesyonel tanı veya
        tedavi yerine geçmez. Ciddi psikolojik sorunlar için bir uzmana
        başvurmanızı öneririz.
      </p>
    </section>
  );
}
