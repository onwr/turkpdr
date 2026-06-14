import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReflexInfoCard() {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="text-lg text-brand-navy">Not</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Ortalama bir insan bu oyunda <strong>17 sn</strong> dayanabilmektedir.
        </p>
        <p>
          <strong>25 sn</strong> üzeri gerçekten çok iyi bir skor sayılmaktadır.
        </p>
        <p>
          Jet pilotlarının ortalama süresi <strong>45 sn</strong>, Formula-1
          yarışçılarınınki ise <strong>60 sn</strong> üzeridir.
        </p>
      </CardContent>
    </Card>
  );
}
