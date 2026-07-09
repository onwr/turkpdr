import type {
  Article,
  Author,
  FileItem,
  NavItem,
  NewsItem,
  PsychologicalTest,
  StatItem,
  TestCategoryFilter,
} from "@/types/home";

export const navItems: NavItem[] = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Makaleler", href: "/makaleler" },
  { label: "Haberler", href: "/haberler" },
  { label: "Psiko Sanat", href: "/psiko-sanat" },
  { label: "Test Merkezi", href: "/test-merkezi" },
  { label: "Üniversite Arama", href: "/universite-arama" },
  { label: "Dosyalar", href: "/dosyalar" },
  { label: "Sözlük", href: "/sozluk" },
  { label: "Videolar", href: "/videolar" },
  { label: "Yazarlar", href: "/yazarlar" },
];

export const stats: StatItem[] = [
  { id: "articles", label: "Toplam Makale", value: 2847, icon: "articles" },
  { id: "tests", label: "Toplam Test", value: 156, icon: "tests" },
  { id: "members", label: "Toplam Üye", value: 12450, icon: "members" },
  { id: "files", label: "Toplam Dosya", value: 892, icon: "files" },
];

export const featuredArticles: Article[] = [
  {
    id: "1",
    slug: "ergenlerde-kaygi-yonetimi",
    title: "Ergenlerde Kaygı Yönetimi: Etkili Stratejiler",
    excerpt:
      "Ergenlik döneminde kaygı ile başa çıkmak için kanıta dayalı yaklaşımlar ve uygulanabilir teknikler.",
    category: "Ergen Psikolojisi",
    author: "Dr. Ayşe Yılmaz",
    date: "12 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  },
  {
    id: "2",
    slug: "okul-rehberligi-iletisim",
    title: "Okul Rehberliğinde Etkili İletişim Teknikleri",
    excerpt:
      "Rehber öğretmenlerin öğrenci ve velilerle kurduğu iletişimi güçlendiren pratik yöntemler.",
    category: "Rehberlik",
    author: "Uzm. Psk. Mehmet Kaya",
    date: "10 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
  },
  {
    id: "3",
    slug: "bdt-uygulamalari",
    title: "Bilişsel Davranışçı Terapi: Güncel Uygulamalar",
    excerpt:
      "BDT'nin klinik ortamda uygulanması, vaka örnekleri ve süpervizyon önerileri.",
    category: "Klinik Psikoloji",
    author: "Prof. Dr. Zeynep Arslan",
    date: "8 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
  },
];

export const testCategories: TestCategoryFilter[] = [
  { id: "all", label: "Tümü" },
  { id: "cocuk", label: "Çocuk" },
  { id: "ergen", label: "Ergen" },
  { id: "yetişkin", label: "Yetişkin" },
  { id: "meslek", label: "Meslek" },
  { id: "klinik", label: "Klinik" },
];

export const psychologicalTests: PsychologicalTest[] = [
  {
    id: "1",
    title: "Beck Depresyon Testi",
    category: "klinik",
    duration: 10,
    questionCount: 21,
    slug: "beck-depresyon",
  },
  {
    id: "2",
    title: "Kaygı Testi",
    category: "yetişkin",
    duration: 8,
    questionCount: 20,
    slug: "kaygi-testi",
  },
  {
    id: "3",
    title: "Özgüven Testi",
    category: "ergen",
    duration: 12,
    questionCount: 25,
    slug: "ozguven-testi",
  },
  {
    id: "4",
    title: "Mesleki Yönelim Testi",
    category: "meslek",
    duration: 15,
    questionCount: 30,
    slug: "mesleki-yonelim",
  },
  {
    id: "5",
    title: "Çocuk Davranış Değerlendirme",
    category: "cocuk",
    duration: 10,
    questionCount: 18,
    slug: "cocuk-davranis",
  },
  {
    id: "6",
    title: "Stres Düzeyi Ölçeği",
    category: "klinik",
    duration: 7,
    questionCount: 14,
    slug: "stres-olcegi",
  },
];

export const files: FileItem[] = [
  {
    id: "1",
    name: "BDT Seans Formu",
    category: "Klinik Formlar",
    downloadCount: 3420,
    slug: "bdt-seans-formu",
  },
  {
    id: "2",
    name: "Veli Bilgilendirme Mektubu",
    category: "Rehberlik",
    downloadCount: 2180,
    slug: "veli-bilgilendirme",
  },
  {
    id: "3",
    name: "Dikkat Eksikliği Değerlendirme",
    category: "Test Materyalleri",
    downloadCount: 1890,
    slug: "dikkat-eksikligi",
  },
  {
    id: "4",
    name: "Grup Terapisi Etkinlik Seti",
    category: "Etkinlikler",
    downloadCount: 1560,
    slug: "grup-terapisi",
  },
  {
    id: "5",
    name: "Öğrenci Görüşme Kayıt Formu",
    category: "Rehberlik",
    downloadCount: 2940,
    slug: "ogrenci-gorusme",
  },
  {
    id: "6",
    name: "Aile Danışmanlığı Rehberi",
    category: "Eğitim Materyalleri",
    downloadCount: 1240,
    slug: "aile-danismanligi",
  },
];

export const authors: Author[] = [
  {
    id: "1",
    name: "Dr. Ayşe Yılmaz",
    title: "Klinik Psikolog",
    articleCount: 87,
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
    slug: "ayse-yilmaz",
  },
  {
    id: "2",
    name: "Uzm. Psk. Mehmet Kaya",
    title: "Rehber Öğretmen",
    articleCount: 64,
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    slug: "mehmet-kaya",
  },
  {
    id: "3",
    name: "Prof. Dr. Zeynep Arslan",
    title: "Psikoloji Profesörü",
    articleCount: 112,
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    slug: "zeynep-arslan",
  },
  {
    id: "4",
    name: "Uzm. Psk. Deniz Öztürk",
    title: "Çocuk Psikoloğu",
    articleCount: 53,
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80",
    slug: "deniz-ozturk",
  },
];

export const newsItems: NewsItem[] = [
  {
    id: "1",
    slug: "pdr-kongresi-2026",
    title: "Türkiye PDR Kongresi 2026: Yenilikçi Yaklaşımlar ve Gelecek Vizyonu",
    excerpt:
      "Bu yıl İstanbul'da düzenlenen kongrede dijital rehberlik, yapay zeka destekli değerlendirme ve okul psikolojisi alanındaki son gelişmeler ele alındı.",
    category: "Etkinlik",
    date: "13 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    featured: true,
  },
  {
    id: "2",
    slug: "yeni-test-merkezi",
    title: "Test Merkezine 12 Yeni Psikolojik Ölçek Eklendi",
    excerpt: "Meslek seçimi ve klinik değerlendirme için yeni testler yayında.",
    category: "Platform",
    date: "11 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1434030214721-865e57f9e4c4?w=600&q=80",
  },
  {
    id: "3",
    slug: "ergen-sagligi-semineri",
    title: "Ücretsiz Ergen Sağlığı Semineri Kayıtları Açıldı",
    excerpt: "Uzman konuşmacıların sunumları artık video arşivinde.",
    category: "Eğitim",
    date: "9 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
  },
  {
    id: "4",
    slug: "rehberlik-mufredati",
    title: "2026 Rehberlik Müfredatı Güncellemeleri Yayınlandı",
    excerpt: "MEB'in yeni rehberlik programı detayları ve uygulama önerileri.",
    category: "MEB",
    date: "7 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
  },
  {
    id: "5",
    slug: "supervizyon-programi",
    title: "Süpervizyon Programı Başvuruları Başladı",
    excerpt: "Klinik psikologlar için 8 haftalık online süpervizyon programı.",
    category: "Eğitim",
    date: "5 Haziran 2026",
    coverImage:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
  },
];

export const footerLinks = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
  { label: "KVKK", href: "/kvkk" },
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
];
