import type {
  PopularContent,
  ProfileFavorite,
  ProfileFile,
  ProfilePost,
  UserProfile,
} from "@/types/profile";

export const profiles: UserProfile[] = [
  {
    id: "ayse-yilmaz",
    name: "Dr. Ayşe Yılmaz",
    title: "Klinik Psikolog",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    about:
      "15 yıllık klinik deneyime sahip klinik psikolog. Ergen ve yetişkin psikolojisi, kaygı bozuklukları ve bilişsel davranışçı terapi alanlarında uzmanlaşmıştır. TürkPDR platformunda düzenli olarak makale ve eğitim içerikleri paylaşmaktadır.",
    workAreas: ["Ergen Psikolojisi", "Kaygı Bozuklukları", "BDT", "Aile Danışmanlığı"],
    expertiseAreas: [
      "Bilişsel Davranışçı Terapi",
      "Ergen Terapisi",
      "Anksiyete Müdahaleleri",
      "Grup Terapisi",
    ],
    totalPosts: 87,
    totalFiles: 24,
    totalLikes: 3420,
    joinedAt: "2022-03-15",
    joinedDate: "Mart 2022",
    email: "ayse.yilmaz@turkpdr.com",
    phone: "+90 532 000 00 01",
    city: "İstanbul",
    website: "https://ayseyilmaz.com",
    seoTitle: "Dr. Ayşe Yılmaz — Klinik Psikolog Profili | TürkPDR",
    seoDescription:
      "Dr. Ayşe Yılmaz'ın TürkPDR profili. Makaleleri, dosyaları ve uzmanlık alanları.",
  },
  {
    id: "mehmet-kaya",
    name: "Uzm. Psk. Mehmet Kaya",
    title: "Rehber Öğretmen",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
    about:
      "12 yıllık okul rehberliği deneyimine sahip rehber öğretmen. Öğrenci rehberliği, kariyer danışmanlığı ve veli iletişimi konularında uzmanlaşmıştır.",
    workAreas: ["Okul Rehberliği", "Kariyer Danışmanlığı", "Veli İletişimi"],
    expertiseAreas: [
      "Mesleki Rehberlik",
      "Öğrenci Görüşmesi",
      "Veli Danışmanlığı",
      "Sınıf Rehberliği",
    ],
    totalPosts: 64,
    totalFiles: 38,
    totalLikes: 2180,
    joinedAt: "2021-09-01",
    joinedDate: "Eylül 2021",
    email: "mehmet.kaya@turkpdr.com",
    city: "Ankara",
    seoTitle: "Uzm. Psk. Mehmet Kaya — Rehber Öğretmen Profili | TürkPDR",
    seoDescription:
      "Uzm. Psk. Mehmet Kaya'nın TürkPDR profili. Rehberlik yazıları, dosyaları ve uzmanlık alanları.",
  },
  {
    id: "deniz-ozturk",
    name: "Uzm. Psk. Deniz Öztürk",
    title: "Çocuk Psikoloğu",
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
    about:
      "Çocuk ve ergen psikolojisi alanında 10 yıllık deneyime sahip uzman psikolog. Oyun terapisi, dikkat eksikliği ve davranış sorunları konularında çalışmaktadır.",
    workAreas: ["Çocuk Psikolojisi", "Oyun Terapisi", "DEHB", "Davranış Sorunları"],
    expertiseAreas: [
      "Oyun Terapisi",
      "Çocuk Değerlendirme",
      "Ebeveyn Danışmanlığı",
      "Gelişimsel Müdahale",
    ],
    totalPosts: 53,
    totalFiles: 19,
    totalLikes: 1890,
    joinedAt: "2023-01-20",
    joinedDate: "Ocak 2023",
    email: "deniz.ozturk@turkpdr.com",
    phone: "+90 533 000 00 03",
    city: "İzmir",
    seoTitle: "Uzm. Psk. Deniz Öztürk — Çocuk Psikoloğu Profili | TürkPDR",
    seoDescription:
      "Uzm. Psk. Deniz Öztürk'ün TürkPDR profili. Çocuk psikolojisi makaleleri ve uzmanlık alanları.",
  },
];

const profilePosts: Record<string, ProfilePost[]> = {
  "ayse-yilmaz": [
    {
      id: "1",
      title: "Ergenlerde Kaygı Yönetimi: Etkili Stratejiler",
      excerpt: "Ergenlik döneminde kaygı ile başa çıkmak için kanıta dayalı yaklaşımlar.",
      category: "Ergen Psikolojisi",
      type: "makale",
      slug: "ergenlerde-kaygi-yonetimi",
      date: "12 Haziran 2026",
      likeCount: 342,
      coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80",
    },
    {
      id: "2",
      title: "Aile Danışmanlığında İletişim Becerileri",
      excerpt: "Aile seanslarında etkili iletişim kurma teknikleri ve uygulama önerileri.",
      category: "Aile Danışmanlığı",
      type: "makale",
      slug: "aile-danismanligi-iletisim",
      date: "5 Haziran 2026",
      likeCount: 198,
      coverImage: "https://images.unsplash.com/photo-1516307365426-bea5f7805107?w=400&q=80",
    },
    {
      id: "3",
      title: "Yaz Döneminde Ergen Ruh Sağlığı",
      excerpt: "Tatil döneminde ergenlerin ruh sağlığını destekleme önerileri.",
      category: "Ergen Psikolojisi",
      type: "haber",
      slug: "yaz-donemi-ergen-ruh-sagligi",
      date: "1 Haziran 2026",
      likeCount: 156,
      coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    },
  ],
  "mehmet-kaya": [
    {
      id: "1",
      title: "Okul Rehberliğinde Etkili İletişim Teknikleri",
      excerpt: "Rehber öğretmenlerin öğrenci ve velilerle kurduğu iletişimi güçlendiren yöntemler.",
      category: "Rehberlik",
      type: "makale",
      slug: "okul-rehberligi-iletisim",
      date: "10 Haziran 2026",
      likeCount: 218,
      coverImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
    },
    {
      id: "2",
      title: "Lise Öğrencileri İçin Kariyer Planlama Rehberi",
      excerpt: "Kariyer seçim sürecinde öğrencilere rehberlik etme stratejileri.",
      category: "Mesleki Rehberlik",
      type: "makale",
      slug: "kariyer-planlama-rehberi",
      date: "3 Haziran 2026",
      likeCount: 174,
      coverImage: "https://images.unsplash.com/photo-1434030214721-865e57f9e4c4?w=400&q=80",
    },
  ],
  "deniz-ozturk": [
    {
      id: "1",
      title: "Çocuklarda Oyun Terapisinin Rolü",
      excerpt: "Oyun terapisinin çocuk gelişimindeki yeri ve uygulama ilkeleri.",
      category: "Çocuk Psikolojisi",
      type: "makale",
      slug: "cocuklarda-oyun-terapisi",
      date: "8 Haziran 2026",
      likeCount: 267,
      coverImage: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
    },
    {
      id: "2",
      title: "DEHB'de Ebeveyn Eğitimi Programları",
      excerpt: "Dikkat eksikliği olan çocukların ailelerine yönelik eğitim modülleri.",
      category: "DEHB",
      type: "makale",
      slug: "dehb-ebeveyn-egitimi",
      date: "2 Haziran 2026",
      likeCount: 143,
      coverImage: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400&q=80",
    },
  ],
};

const profileFiles: Record<string, ProfileFile[]> = {
  "ayse-yilmaz": [
    { id: "1", name: "BDT Seans Formu", category: "Klinik Formlar", downloadCount: 890, fileType: "PDF", slug: "bdt-seans-formu", date: "10 Haziran 2026" },
    { id: "2", name: "Kaygı Yönetimi Etkinlik Seti", category: "Etkinlikler", downloadCount: 654, fileType: "PDF", slug: "kaygi-yonetimi-etkinlik", date: "5 Haziran 2026" },
    { id: "3", name: "Ergen Görüşme Kayıt Formu", category: "Formlar", downloadCount: 432, fileType: "PDF", slug: "ergen-gorusme-formu", date: "1 Haziran 2026" },
  ],
  "mehmet-kaya": [
    { id: "1", name: "Veli Bilgilendirme Mektubu", category: "Rehberlik", downloadCount: 1240, fileType: "PDF", slug: "veli-bilgilendirme", date: "9 Haziran 2026" },
    { id: "2", name: "Öğrenci Görüşme Kayıt Formu", category: "Rehberlik", downloadCount: 980, fileType: "PDF", slug: "ogrenci-gorusme", date: "4 Haziran 2026" },
    { id: "3", name: "Kariyer Seçim Anketi", category: "Test Materyalleri", downloadCount: 756, fileType: "PDF", slug: "kariyer-secim-anketi", date: "28 Mayıs 2026" },
  ],
  "deniz-ozturk": [
    { id: "1", name: "Oyun Terapisi Gözlem Formu", category: "Klinik Formlar", downloadCount: 567, fileType: "PDF", slug: "oyun-terapisi-gozlem", date: "7 Haziran 2026" },
    { id: "2", name: "DEHB Davranış Takip Çizelgesi", category: "Formlar", downloadCount: 823, fileType: "PDF", slug: "dehb-takip-cizelgesi", date: "30 Mayıs 2026" },
  ],
};

const profileFavorites: Record<string, ProfileFavorite[]> = {
  "ayse-yilmaz": [
    { id: "1", title: "Bilişsel Davranışçı Terapi: Güncel Uygulamalar", type: "makale", slug: "bdt-uygulamalari", savedAt: "11 Haziran 2026" },
    { id: "2", title: "Beck Depresyon Testi", type: "test", slug: "beck-depresyon", savedAt: "8 Haziran 2026" },
    { id: "3", title: "Grup Terapisi Etkinlik Seti", type: "dosya", slug: "grup-terapisi", savedAt: "5 Haziran 2026" },
  ],
  "mehmet-kaya": [
    { id: "1", title: "Ergenlerde Kaygı Yönetimi", type: "makale", slug: "ergenlerde-kaygi-yonetimi", savedAt: "12 Haziran 2026" },
    { id: "2", title: "Mesleki Yönelim Testi", type: "test", slug: "mesleki-yonelim", savedAt: "6 Haziran 2026" },
  ],
  "deniz-ozturk": [
    { id: "1", title: "Çocuk Davranış Değerlendirme", type: "test", slug: "cocuk-davranis", savedAt: "10 Haziran 2026" },
    { id: "2", title: "Aile Danışmanlığı Rehberi", type: "dosya", slug: "aile-danismanligi", savedAt: "4 Haziran 2026" },
    { id: "3", title: "Yaz Döneminde Ergen Ruh Sağlığı", type: "haber", slug: "yaz-donemi-ergen-ruh-sagligi", savedAt: "1 Haziran 2026" },
  ],
};

const popularContent: Record<string, PopularContent[]> = {
  "ayse-yilmaz": [
    { id: "1", title: "Ergenlerde Kaygı Yönetimi", type: "Makale", slug: "ergenlerde-kaygi-yonetimi", viewCount: 4820 },
    { id: "2", title: "Aile Danışmanlığında İletişim", type: "Makale", slug: "aile-danismanligi-iletisim", viewCount: 2940 },
    { id: "3", title: "BDT Seans Formu", type: "Dosya", slug: "bdt-seans-formu", viewCount: 1890 },
  ],
  "mehmet-kaya": [
    { id: "1", title: "Okul Rehberliğinde İletişim", type: "Makale", slug: "okul-rehberligi-iletisim", viewCount: 3650 },
    { id: "2", title: "Veli Bilgilendirme Mektubu", type: "Dosya", slug: "veli-bilgilendirme", viewCount: 2180 },
    { id: "3", title: "Kariyer Planlama Rehberi", type: "Makale", slug: "kariyer-planlama-rehberi", viewCount: 1560 },
  ],
  "deniz-ozturk": [
    { id: "1", title: "Çocuklarda Oyun Terapisi", type: "Makale", slug: "cocuklarda-oyun-terapisi", viewCount: 2340 },
    { id: "2", title: "DEHB Ebeveyn Eğitimi", type: "Makale", slug: "dehb-ebeveyn-egitimi", viewCount: 1780 },
    { id: "3", title: "Oyun Terapisi Gözlem Formu", type: "Dosya", slug: "oyun-terapisi-gozlem", viewCount: 1240 },
  ],
};

export function getAllProfileIds(): string[] {
  return profiles.map((p) => p.id);
}

export function getProfileById(id: string): UserProfile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getProfilePosts(id: string): ProfilePost[] {
  return profilePosts[id] ?? [];
}

export function getProfileFiles(id: string): ProfileFile[] {
  return profileFiles[id] ?? [];
}

export function getProfileFavorites(id: string): ProfileFavorite[] {
  return profileFavorites[id] ?? [];
}

export function getProfilePopularContent(id: string): PopularContent[] {
  return popularContent[id] ?? [];
}
