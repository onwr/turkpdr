import type { Metadata } from "next";

import { StaticContentPage } from "@/components/shared/static-content-page";
import { getSiteSettings } from "@/lib/queries/settings";
import { defaultSiteSettingsFormState } from "@/types/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim",
  description: "TürkPDR ile iletişime geçin. Soru, öneri ve iş birliği talepleriniz için bize ulaşın.",
};

export default async function IletisimPage() {
  const settings = await getSiteSettings();
  const email =
    settings.contactEmail ?? defaultSiteSettingsFormState.contactEmail;
  const phone =
    settings.contactPhone ?? defaultSiteSettingsFormState.contactPhone;

  return (
    <StaticContentPage
      title="İletişim"
      description="Sorularınız, önerileriniz ve iş birliği talepleriniz için bizimle iletişime geçebilirsiniz."
      badge="İletişim"
    >
      <p>
        TürkPDR ekibi olarak geri bildirimlerinize değer veriyoruz. Aşağıdaki
        kanallardan bize ulaşabilirsiniz.
      </p>
      <h2>İletişim Bilgileri</h2>
      <ul>
        {email && (
          <li>
            E-posta:{" "}
            <a href={`mailto:${email}`} className="text-brand-blue hover:underline">
              {email}
            </a>
          </li>
        )}
        {phone && <li>Telefon: {phone}</li>}
      </ul>
      <h2>Çalışma Saatleri</h2>
      <p>
        Hafta içi 09:00 – 18:00 saatleri arasında mesajlarınıza en kısa sürede
        dönüş yapılmaktadır.
      </p>
      <h2>İş Birliği</h2>
      <p>
        İçerik iş birliği, sponsorluk veya teknik destek talepleri için lütfen
        e-posta yoluyla detaylı bilgi paylaşın.
      </p>
    </StaticContentPage>
  );
}
