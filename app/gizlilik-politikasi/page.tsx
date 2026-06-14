import type { Metadata } from "next";

import { StaticContentPage } from "@/components/shared/static-content-page";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "TürkPDR gizlilik politikası. Kişisel verilerinizin nasıl toplandığı ve korunduğu hakkında bilgi.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <StaticContentPage
      title="Gizlilik Politikası"
      description="Kişisel verilerinizin korunması ve gizliliğiniz bizim için önemlidir."
      badge="Yasal"
    >
      <p>
        Bu Gizlilik Politikası, TürkPDR platformunu kullanırken kişisel
        verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu
        açıklamaktadır.
      </p>
      <h2>Toplanan Bilgiler</h2>
      <p>
        Kayıt sırasında sağladığınız bilgiler, platform üzerindeki
        etkileşimleriniz ve teknik log verileri (IP adresi, tarayıcı türü,
        oturum bilgileri) hizmet kalitesini artırmak amacıyla işlenebilir.
      </p>
      <h2>Çerezler</h2>
      <p>
        Oturum yönetimi ve site analitiği için çerezler kullanılmaktadır.
        Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz.
      </p>
      <h2>Veri Güvenliği</h2>
      <p>
        Verileriniz yetkisiz erişime karşı teknik ve idari tedbirlerle
        korunmaktadır. Şifreler güvenli yöntemlerle saklanır; ödeme bilgisi
        işlenmemektedir.
      </p>
      <h2>Üçüncü Taraflar</h2>
      <p>
        Yasal zorunluluklar dışında kişisel verileriniz üçüncü taraflarla
        paylaşılmaz. Analitik araçları yalnızca anonimleştirilmiş verilerle
        çalışabilir.
      </p>
      <h2>İletişim</h2>
      <p>
        Gizlilik ile ilgili sorularınız için{" "}
        <a href="/iletisim" className="text-brand-blue hover:underline">
          iletişim sayfamızı
        </a>{" "}
        kullanabilirsiniz.
      </p>
    </StaticContentPage>
  );
}
