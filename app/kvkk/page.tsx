import type { Metadata } from "next";

import { StaticContentPage } from "@/components/shared/static-content-page";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "TürkPDR Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <StaticContentPage
      title="KVKK Aydınlatma Metni"
      description="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme."
      badge="Yasal"
    >
      <p>
        TürkPDR olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu
        metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
        kapsamında veri sorumlusu sıfatıyla sizi bilgilendirmek amacıyla
        hazırlanmıştır.
      </p>
      <h2>Veri Sorumlusu</h2>
      <p>
        TürkPDR platformu, kullanıcılarına ait kişisel verileri KVKK ve ilgili
        mevzuata uygun şekilde işlemektedir.
      </p>
      <h2>İşlenen Kişisel Veriler</h2>
      <ul>
        <li>Kimlik ve iletişim bilgileri (ad, soyad, e-posta)</li>
        <li>Üyelik ve hesap bilgileri</li>
        <li>Platform kullanım verileri ve çerez kayıtları</li>
        <li>İçerik etkileşim verileri (yorum, beğeni, favori)</li>
      </ul>
      <h2>İşleme Amaçları</h2>
      <p>
        Kişisel verileriniz; üyelik işlemlerinin yürütülmesi, platform
        hizmetlerinin sunulması, güvenliğin sağlanması, yasal yükümlülüklerin
        yerine getirilmesi ve kullanıcı deneyiminin iyileştirilmesi amaçlarıyla
        işlenmektedir.
      </p>
      <h2>Haklarınız</h2>
      <p>
        KVKK&apos;nın 11. maddesi kapsamında kişisel verilerinizle ilgili
        bilgi talep etme, düzeltme, silme ve itiraz haklarına sahipsiniz.
        Talepleriniz için{" "}
        <a href="/iletisim" className="text-brand-blue hover:underline">
          iletişim
        </a>{" "}
        sayfamızdan bize ulaşabilirsiniz.
      </p>
    </StaticContentPage>
  );
}
