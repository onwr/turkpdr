import { AlertTriangle, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Scl90rInfoCard() {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg text-brand-navy">
          <Info className="size-5 text-brand-blue" />
          Test Hakkında
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Aşağıdaki maddeler zaman zaman herkeste görülebilecek yakınma ve
          sorunları içerir. Lütfen <strong>son üç ay</strong> içerisinde sizi
          ne ölçüde huzursuz ettiğini işaretleyiniz.
        </p>
        <p>
          Bu test psikolojik belirti tarama amacıyla hazırlanmıştır.{" "}
          <strong>Hastalık tanısı koymaz.</strong> Sonuçlar yalnızca
          bilgilendirme amaçlıdır.
        </p>
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Kendinize zarar verme, yaşamınızın sonlanması veya aşırı umutsuzluk
            gibi düşünceleriniz varsa lütfen vakit kaybetmeden bir ruh sağlığı
            uzmanından veya{" "}
            <strong>ALO 182 Psikolojik Destek Hattı</strong>ndan profesyonel
            destek alın.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
