import type {
  ArticleCategory,
  ArticleComment,
  ArticleDetail,
  PopularArticle,
  RelatedArticle,
} from "@/types/article";

const authors = {
  ayse: {
    name: "Dr. Ayşe Yılmaz",
    title: "Klinik Psikolog",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
    bio: "15 yıllık klinik deneyime sahip, ergen ve yetişkin psikolojisi alanında uzmanlaşmış klinik psikolog.",
    slug: "ayse-yilmaz",
    articleCount: 87,
  },
  mehmet: {
    name: "Uzm. Psk. Mehmet Kaya",
    title: "Rehber Öğretmen",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
    bio: "Okul rehberliği ve kariyer danışmanlığı alanında 12 yıllık deneyime sahip rehber öğretmen.",
    slug: "mehmet-kaya",
    articleCount: 64,
  },
  zeynep: {
    name: "Prof. Dr. Zeynep Arslan",
    title: "Psikoloji Profesörü",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
    bio: "Klinik psikoloji ve bilişsel davranışçı terapi alanında akademisyen ve süpervizör.",
    slug: "zeynep-arslan",
    articleCount: 112,
  },
};

const articleContent: Record<string, string> = {
  "ergenlerde-kaygi-yonetimi": `
    <p>Ergenlik dönemi, bireyin kimlik gelişimi, sosyal ilişkiler ve akademik beklentilerin yoğunlaştığı kritik bir süreçtir. Bu dönemde kaygı deneyimleri oldukça yaygındır ve doğru yönetildiğinde sağlıklı bir gelişimin parçası haline gelebilir.</p>

    <h2>Kaygının Ergenlik Dönemindeki Yansımaları</h2>
    <p>Ergenlerde kaygı; akademik performans, akran ilişkileri, görünüm, gelecek kaygısı ve aile beklentileri gibi çeşitli alanlarda kendini gösterebilir. Fizyolojik belirtiler arasında kalp çarpıntısı, mide rahatsızlıkları ve uyku sorunları sayılabilir.</p>

    <blockquote>Ergenlerin kaygılarını bastırmak yerine anlamlandırmalarına ve ifade etmelerine alan açmak, uzun vadede daha sağlıklı başa çıkma becerileri geliştirmelerini sağlar.</blockquote>

    <h2>Kanıta Dayalı Müdahale Stratejileri</h2>
    <ul>
      <li><strong>Bilişsel Yeniden Yapılandırma:</strong> Olumsuz otomatik düşüncelerin fark edilmesi ve sorgulanması</li>
      <li><strong>Nefes ve Gevşeme Teknikleri:</strong> Günlük rutine entegre edilebilir pratik uygulamalar</li>
      <li><strong>Problem Çözme Becerileri:</strong> Kaygı kaynağına yönelik adım adım çözüm planları</li>
      <li><strong>Farkındalık Temelli Yaklaşımlar:</strong> Anın kabulü ve duygusal farkındalık geliştirme</li>
    </ul>

    <h2>Okul Ortamında Uygulama Önerileri</h2>
    <p>Rehber öğretmenler ve psikolojik danışmanlar, okul içi müdahale programları ile ergenlerin kaygı yönetimi becerilerini destekleyebilir. Grup çalışmaları, bireysel görüşmeler ve veli iş birliği bu süreçte kritik rol oynar.</p>

    <h2>Sonuç</h2>
    <p>Ergenlerde kaygı yönetimi, çok disiplinli bir yaklaşım gerektirir. Erken müdahale, destekleyici bir okul iklimi ve profesyonel rehberlik ile ergenlerin kaygılarıyla sağlıklı başa çıkmaları mümkündür.</p>
  `,
  "okul-rehberligi-iletisim": `
    <p>Okul rehberliğinde etkili iletişim, öğrenci-gelişim sürecinin temel taşlarından biridir. Rehber öğretmenlerin öğrenci, veli ve öğretmenlerle kurduğu iletişim kalitesi, rehberlik hizmetlerinin etkinliğini doğrudan etkiler.</p>

    <h2>Aktif Dinleme Becerileri</h2>
    <p>Aktif dinleme, karşıdaki kişinin söylediklerini yargılamadan, empati ile dinlemeyi ve geri bildirim vermeyi içerir. Öğrenci görüşmelerinde bu beceri, güven ilişkisinin kurulmasında vazgeçilmezdir.</p>

    <h2>Veli İletişiminde Dikkat Edilecek Noktalar</h2>
    <ol>
      <li>Veli görüşmelerinde çözüm odaklı bir dil kullanın</li>
      <li>Öğrencinin güçlü yönlerini vurgulayın</li>
      <li>Somut örnekler ve gözlemler paylaşın</li>
      <li>İş birliğine dayalı bir yaklaşım benimseyin</li>
    </ol>

    <h2>Öğretmenlerle İş Birliği</h2>
    <p>Rehber öğretmenler, sınıf öğretmenleri ile düzenli iletişim halinde olarak öğrencilerin gelişimini bütüncül bir perspektifle değerlendirebilir. Ortak toplantılar ve vaka tartışmaları bu süreci destekler.</p>
  `,
  "bdt-uygulamalari": `
    <p>Bilişsel Davranışçı Terapi (BDT), depresyon ve anksiyete bozukluklarında en çok araştırılmış ve etkinliği kanıtlanmış psikoterapi yaklaşımlarından biridir. Bu makalede BDT'nin güncel klinik uygulamalarını ele alıyoruz.</p>

    <h2>BDT'nin Temel İlkeleri</h2>
    <p>BDT, düşünce-duygu-davranış üçgeni üzerine kuruludur. Bireyin olumsuz otomatik düşünceleri, duygusal ve davranışsal tepkilerini şekillendirir. Terapi sürecinde bu düşünce kalıplarının fark edilmesi ve değiştirilmesi hedeflenir.</p>

    <h2>Seans Yapısı ve Teknikler</h2>
    <ul>
      <li>Düşünce kayıtları ve bilişsel yeniden yapılandırma</li>
      <li>Davranışsal aktivasyon ve maruz bırakma</li>
      <li>Ev ödevleri ve süreklilik planları</li>
      <li>Mindfulness entegrasyonu</li>
    </ul>

    <h2>Süpervizyon ve Etik</h2>
    <p>BDT uygulayıcıları, düzenli süpervizyon alarak mesleki gelişimlerini sürdürmelidir. Etik ilkeler ve sınır yönetimi, etkili terapi sürecinin ayrılmaz parçalarıdır.</p>
  `,
};

export const articles: ArticleDetail[] = [
  {
    id: "1",
    slug: "ergenlerde-kaygi-yonetimi",
    title: "Ergenlerde Kaygı Yönetimi: Etkili Stratejiler",
    excerpt:
      "Ergenlik döneminde kaygı ile başa çıkmak için kanıta dayalı yaklaşımlar ve uygulanabilir teknikler.",
    category: "Ergen Psikolojisi",
    categorySlug: "ergen-psikolojisi",
    author: authors.ayse,
    date: "12 Haziran 2026",
    publishedAt: "2026-06-12",
    readTime: 8,
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
    content: articleContent["ergenlerde-kaygi-yonetimi"],
    likeCount: 342,
    seoTitle: "Ergenlerde Kaygı Yönetimi: Etkili Stratejiler | TürkPDR",
    seoDescription:
      "Ergenlerde kaygı yönetimi için kanıta dayalı müdahale stratejileri, okul rehberliği uygulamaları ve pratik teknikler.",
    tags: ["ergen psikolojisi", "kaygı", "rehberlik", "BDT"],
    ogImage: null,
    canonicalUrl: "https://turkpdr.com/makaleler/ergenlerde-kaygi-yonetimi",
    noIndex: false,
  },
  {
    id: "2",
    slug: "okul-rehberligi-iletisim",
    title: "Okul Rehberliğinde Etkili İletişim Teknikleri",
    excerpt:
      "Rehber öğretmenlerin öğrenci ve velilerle kurduğu iletişimi güçlendiren pratik yöntemler.",
    category: "Rehberlik",
    categorySlug: "rehberlik",
    author: authors.mehmet,
    date: "10 Haziran 2026",
    publishedAt: "2026-06-10",
    readTime: 6,
    coverImage:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    content: articleContent["okul-rehberligi-iletisim"],
    likeCount: 218,
    seoTitle: "Okul Rehberliğinde Etkili İletişim Teknikleri | TürkPDR",
    seoDescription:
      "Rehber öğretmenler için aktif dinleme, veli iletişimi ve öğretmen iş birliği teknikleri.",
    tags: ["rehberlik", "iletişim", "okul", "veli"],
    ogImage: null,
    canonicalUrl: "https://turkpdr.com/makaleler/okul-rehberligi-iletisim",
    noIndex: false,
  },
  {
    id: "3",
    slug: "bdt-uygulamalari",
    title: "Bilişsel Davranışçı Terapi: Güncel Uygulamalar",
    excerpt:
      "BDT'nin klinik ortamda uygulanması, vaka örnekleri ve süpervizyon önerileri.",
    category: "Klinik Psikoloji",
    categorySlug: "klinik-psikoloji",
    author: authors.zeynep,
    date: "8 Haziran 2026",
    publishedAt: "2026-06-08",
    readTime: 10,
    coverImage:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
    content: articleContent["bdt-uygulamalari"],
    likeCount: 456,
    seoTitle: "Bilişsel Davranışçı Terapi: Güncel Uygulamalar | TürkPDR",
    seoDescription:
      "BDT'nin temel ilkeleri, seans yapısı, teknikler ve süpervizyon önerileri hakkında kapsamlı rehber.",
    tags: ["BDT", "klinik psikoloji", "terapi", "süpervizyon"],
    ogImage: null,
    canonicalUrl: "https://turkpdr.com/makaleler/bdt-uygulamalari",
    noIndex: false,
  },
];

export const articleComments: Record<string, ArticleComment[]> = {
  "ergenlerde-kaygi-yonetimi": [
    {
      id: "1",
      author: "Uzm. Psk. Deniz Öztürk",
      avatar:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&q=80",
      date: "13 Haziran 2026",
      content:
        "Çok kapsamlı ve uygulanabilir bir makale. Özellikle okul ortamındaki öneriler çok değerli.",
    },
    {
      id: "2",
      author: "Rehber Öğretmen Ayşe K.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      date: "12 Haziran 2026",
      content:
        "Aktif dinleme bölümünü okulumuzda uygulamaya başladık. Öğrencilerle iletişimimiz belirgin şekilde iyileşti.",
    },
    {
      id: "3",
      author: "Dr. Can Demir",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      date: "11 Haziran 2026",
      content:
        "Kanıta dayalı müdahale stratejileri bölümü literatürle uyumlu. Kaynak önerileri de eklenebilir.",
    },
  ],
  "okul-rehberligi-iletisim": [
    {
      id: "1",
      author: "Psk. Dan. Elif S.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      date: "11 Haziran 2026",
      content: "Veli iletişimi bölümü pratik örneklerle çok iyi anlatılmış.",
    },
  ],
  "bdt-uygulamalari": [
    {
      id: "1",
      author: "Uzm. Psk. Mehmet Kaya",
      avatar:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80",
      date: "9 Haziran 2026",
      content: "Süpervizyon bölümü meslektaşlarım için faydalı bir kaynak olacak.",
    },
    {
      id: "2",
      author: "Dr. Ayşe Yılmaz",
      avatar:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80",
      date: "8 Haziran 2026",
      content: "BDT seans yapısı net ve anlaşılır şekilde açıklanmış. Teşekkürler.",
    },
  ],
};

export const popularArticles: PopularArticle[] = [
  {
    id: "1",
    slug: "ergenlerde-kaygi-yonetimi",
    title: "Ergenlerde Kaygı Yönetimi: Etkili Stratejiler",
    readCount: 4820,
  },
  {
    id: "2",
    slug: "bdt-uygulamalari",
    title: "Bilişsel Davranışçı Terapi: Güncel Uygulamalar",
    readCount: 3650,
  },
  {
    id: "3",
    slug: "okul-rehberligi-iletisim",
    title: "Okul Rehberliğinde Etkili İletişim Teknikleri",
    readCount: 2940,
  },
  {
    id: "4",
    slug: "ergenlerde-kaygi-yonetimi",
    title: "Aile Danışmanlığı Yaklaşımları",
    readCount: 2180,
  },
  {
    id: "5",
    slug: "bdt-uygulamalari",
    title: "Çocuklarda Dikkat Eksikliği Müdahaleleri",
    readCount: 1920,
  },
];

export const articleCategories: ArticleCategory[] = [
  { slug: "ergen-psikolojisi", label: "Ergen Psikolojisi", count: 342 },
  { slug: "rehberlik", label: "Rehberlik", count: 528 },
  { slug: "klinik-psikoloji", label: "Klinik Psikoloji", count: 415 },
  { slug: "cocuk-psikolojisi", label: "Çocuk Psikolojisi", count: 287 },
  { slug: "aile-danismanligi", label: "Aile Danışmanlığı", count: 196 },
  { slug: "mesleki-rehberlik", label: "Mesleki Rehberlik", count: 234 },
];

export function getAllArticleSlugs(): string[] {
  return articles.map((article) => article.slug);
}

export function getArticleBySlug(slug: string): ArticleDetail | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getRelatedArticles(
  slug: string,
  limit = 3
): RelatedArticle[] {
  return articles
    .filter((article) => article.slug !== slug)
    .slice(0, limit)
    .map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      coverImage: article.coverImage,
      readTime: article.readTime,
    }));
}

export function getArticleComments(slug: string): ArticleComment[] {
  return articleComments[slug] ?? [];
}
