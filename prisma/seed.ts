import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  ContentStatus,
  ContentType,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import slugify from "slugify";

const SALT_ROUNDS = 12;

function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: "tr" });
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

const USERS = [
  {
    email: "admin@turkpdr.com",
    name: "Admin Kullanıcı",
    password: "123456",
    role: UserRole.ADMIN,
    title: "Süper Admin",
    bio: "TürkPDR platform yöneticisi.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  },
  {
    email: "editor@turkpdr.com",
    name: "Editör Kullanıcı",
    password: "123456",
    role: UserRole.EDITOR,
    title: "İçerik Editörü",
    bio: "TürkPDR içerik editörü.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    email: "ayse.yilmaz@turkpdr.com",
    name: "Dr. Ayşe Yılmaz",
    password: "123456",
    role: UserRole.AUTHOR,
    title: "Klinik Psikolog",
    bio: "15 yıllık klinik deneyime sahip, ergen ve yetişkin psikolojisi alanında uzmanlaşmış klinik psikolog.",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
  },
  {
    email: "mehmet.kaya@turkpdr.com",
    name: "Uzm. Psk. Mehmet Kaya",
    password: "123456",
    role: UserRole.AUTHOR,
    title: "Rehber Öğretmen",
    bio: "Okul rehberliği ve kariyer danışmanlığı alanında 12 yıllık deneyime sahip rehber öğretmen.",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
  },
  {
    email: "zeynep.arslan@turkpdr.com",
    name: "Prof. Dr. Zeynep Arslan",
    password: "123456",
    role: UserRole.AUTHOR,
    title: "Psikoloji Profesörü",
    bio: "Klinik psikoloji ve bilişsel davranışçı terapi alanında akademisyen ve süpervizör.",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
  },
  {
    email: "deniz.ozturk@turkpdr.com",
    name: "Uzm. Psk. Deniz Öztürk",
    password: "123456",
    role: UserRole.AUTHOR,
    title: "Çocuk Psikoloğu",
    bio: "Çocuk ve ergen psikolojisi alanında 10 yıllık deneyime sahip uzman psikolog.",
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&q=80",
  },
] as const;

const CATEGORIES = [
  { name: "Ergen Psikolojisi", slug: "ergen-psikolojisi", type: ContentType.ARTICLE },
  { name: "Rehberlik", slug: "rehberlik", type: ContentType.GUIDE },
  { name: "Klinik Psikoloji", slug: "klinik-psikoloji", type: ContentType.ARTICLE },
  { name: "Haberler", slug: "haberler", type: ContentType.NEWS },
  { name: "Çocuk", slug: "cocuk", type: ContentType.ARTICLE },
  { name: "Ergen", slug: "ergen", type: ContentType.ARTICLE },
  { name: "Yetişkin", slug: "yetiskin", type: ContentType.ARTICLE },
  { name: "Meslek", slug: "meslek", type: ContentType.ARTICLE },
  { name: "Klinik", slug: "klinik", type: ContentType.ARTICLE },
] as const;

const TAGS = [
  "ergen psikolojisi",
  "kaygı",
  "rehberlik",
  "BDT",
  "klinik psikoloji",
  "terapi",
  "okul rehberliği",
  "mesleki rehberlik",
  "haber",
  "platform",
] as const;

const ARTICLE_CONTENT: Record<string, string> = {
  "ergenlerde-kaygi-yonetimi": `
    <p>Ergenlik dönemi, bireyin kimlik gelişimi, sosyal ilişkiler ve akademik beklentilerin yoğunlaştığı kritik bir süreçtir.</p>
    <h2>Kaygının Ergenlik Dönemindeki Yansımaları</h2>
    <p>Ergenlerde kaygı; akademik performans, akran ilişkileri, görünüm, gelecek kaygısı ve aile beklentileri gibi çeşitli alanlarda kendini gösterebilir.</p>
    <blockquote>Ergenlerin kaygılarını bastırmak yerine anlamlandırmalarına alan açmak, uzun vadede daha sağlıklı başa çıkma becerileri geliştirmelerini sağlar.</blockquote>
    <h2>Kanıta Dayalı Müdahale Stratejileri</h2>
    <ul>
      <li><strong>Bilişsel Yeniden Yapılandırma</strong></li>
      <li><strong>Nefes ve Gevşeme Teknikleri</strong></li>
      <li><strong>Problem Çözme Becerileri</strong></li>
    </ul>
  `,
  "okul-rehberligi-iletisim": `
    <p>Okul rehberliğinde etkili iletişim, öğrenci-gelişim sürecinin temel taşlarından biridir.</p>
    <h2>Aktif Dinleme Becerileri</h2>
    <p>Aktif dinleme, karşıdaki kişinin söylediklerini yargılamadan, empati ile dinlemeyi içerir.</p>
    <h2>Veli İletişiminde Dikkat Edilecek Noktalar</h2>
    <ol>
      <li>Veli görüşmelerinde çözüm odaklı bir dil kullanın</li>
      <li>Öğrencinin güçlü yönlerini vurgulayın</li>
      <li>İş birliğine dayalı bir yaklaşım benimseyin</li>
    </ol>
  `,
  "bdt-uygulamalari": `
    <p>Bilişsel Davranışçı Terapi (BDT), depresyon ve anksiyete bozukluklarında en çok araştırılmış psikoterapi yaklaşımlarından biridir.</p>
    <h2>BDT'nin Temel İlkeleri</h2>
    <p>BDT, düşünce-duygu-davranış üçgeni üzerine kuruludur.</p>
    <h2>Seans Yapısı ve Teknikler</h2>
    <ul>
      <li>Düşünce kayıtları ve bilişsel yeniden yapılandırma</li>
      <li>Davranışsal aktivasyon ve maruz bırakma</li>
      <li>Ev ödevleri ve süreklilik planları</li>
    </ul>
  `,
};

const CONTENTS = [
  {
    slug: "ergenlerde-kaygi-yonetimi",
    title: "Ergenlerde Kaygı Yönetimi: Etkili Stratejiler",
    summary:
      "Ergenlik döneminde kaygı ile başa çıkmak için kanıta dayalı yaklaşımlar ve uygulanabilir teknikler.",
    type: ContentType.ARTICLE,
    categorySlug: "ergen-psikolojisi",
    authorEmail: "ayse.yilmaz@turkpdr.com",
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
    featured: true,
    views: 4820,
    tags: ["ergen psikolojisi", "kaygı", "rehberlik"],
  },
  {
    slug: "okul-rehberligi-iletisim",
    title: "Okul Rehberliğinde Etkili İletişim Teknikleri",
    summary:
      "Rehber öğretmenlerin öğrenci ve velilerle kurduğu iletişimi güçlendiren pratik yöntemler.",
    type: ContentType.GUIDE,
    categorySlug: "rehberlik",
    authorEmail: "mehmet.kaya@turkpdr.com",
    coverImage:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    featured: true,
    views: 3650,
    tags: ["rehberlik", "okul rehberliği"],
  },
  {
    slug: "bdt-uygulamalari",
    title: "Bilişsel Davranışçı Terapi: Güncel Uygulamalar",
    summary:
      "BDT'nin klinik ortamda uygulanması, vaka örnekleri ve süpervizyon önerileri.",
    type: ContentType.ARTICLE,
    categorySlug: "klinik-psikoloji",
    authorEmail: "zeynep.arslan@turkpdr.com",
    coverImage:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
    featured: false,
    views: 2940,
    tags: ["BDT", "klinik psikoloji", "terapi"],
  },
  {
    slug: "test-merkezi-guncellemesi",
    title: "Test Merkezine 12 Yeni Psikolojik Ölçek Eklendi",
    summary:
      "Meslek seçimi ve klinik değerlendirme için yeni testler yayında.",
    type: ContentType.NEWS,
    categorySlug: "haberler",
    authorEmail: "editor@turkpdr.com",
    coverImage:
      "https://images.unsplash.com/photo-1434030214721-865e57f9e4c4?w=1200&q=80",
    featured: true,
    views: 2180,
    tags: ["haber", "platform"],
  },
  {
    slug: "pdr-kongresi-2026",
    title: "Türkiye PDR Kongresi 2026: Yenilikçi Yaklaşımlar",
    summary:
      "İstanbul'da düzenlenen kongrede dijital rehberlik ve okul psikolojisi alanındaki gelişmeler ele alındı.",
    type: ContentType.NEWS,
    categorySlug: "haberler",
    authorEmail: "editor@turkpdr.com",
    coverImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    featured: false,
    views: 1560,
    tags: ["haber"],
  },
] as const;

const TESTS = [
  {
    slug: "beck-depresyon",
    title: "Beck Depresyon Testi",
    description:
      "Depresyon belirtilerinin şiddetini ölçmek için kullanılan klinik değerlendirme ölçeği.",
    categorySlug: "klinik",
    duration: "10",
    questionCount: 21,
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
  },
  {
    slug: "kaygi-testi",
    title: "Kaygı Testi",
    description:
      "Genel kaygı düzeyinizi değerlendirmenize yardımcı olan kapsamlı bir testtir.",
    categorySlug: "yetiskin",
    duration: "8",
    questionCount: 20,
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
  },
  {
    slug: "ozguven-testi",
    title: "Özgüven Testi",
    description:
      "Ergenlerin özgüven düzeylerini değerlendirmek için tasarlanmış bir ölçektir.",
    categorySlug: "ergen",
    duration: "12",
    questionCount: 25,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  },
  {
    slug: "mesleki-yonelim",
    title: "Mesleki Yönelim Testi",
    description:
      "İlgi alanlarınızı ve yeteneklerinizi analiz ederek uygun meslek alanlarını önerir.",
    categorySlug: "meslek",
    duration: "15",
    questionCount: 30,
    image:
      "https://images.unsplash.com/photo-1434030214721-865e57f9e4c4?w=600&q=80",
  },
  {
    slug: "cocuk-davranis",
    title: "Çocuk Davranış Değerlendirme",
    description:
      "6-12 yaş arası çocukların davranışsal ve duygusal gelişimini değerlendiren ölçektir.",
    categorySlug: "cocuk",
    duration: "10",
    questionCount: 18,
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
  },
  {
    slug: "stres-olcegi",
    title: "Stres Düzeyi Ölçeği",
    description:
      "Günlük yaşamda karşılaşılan stres faktörlerini ve stres düzeyinizi ölçer.",
    categorySlug: "klinik",
    duration: "7",
    questionCount: 14,
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
  },
] as const;

const FILES = [
  {
    id: "seed-file-bdt-seans-formu",
    title: "BDT Seans Formu",
    description: "Bilişsel davranışçı terapi seans kayıt formu.",
    fileUrl: "/files/bdt-seans-formu.pdf",
    fileType: "PDF",
    fileSize: 245760,
    downloads: 3420,
    uploaderEmail: "ayse.yilmaz@turkpdr.com",
  },
  {
    id: "seed-file-veli-bilgilendirme",
    title: "Veli Bilgilendirme Mektubu",
    description: "Veli bilgilendirme için hazır mektup şablonu.",
    fileUrl: "/files/veli-bilgilendirme.pdf",
    fileType: "PDF",
    fileSize: 189440,
    downloads: 2180,
    uploaderEmail: "mehmet.kaya@turkpdr.com",
  },
  {
    id: "seed-file-dikkat-eksikligi",
    title: "Dikkat Eksikliği Değerlendirme",
    description: "DEHB ön değerlendirme formu.",
    fileUrl: "/files/dikkat-eksikligi.pdf",
    fileType: "PDF",
    fileSize: 312320,
    downloads: 1890,
    uploaderEmail: "deniz.ozturk@turkpdr.com",
  },
  {
    id: "seed-file-grup-terapisi",
    title: "Grup Terapisi Etkinlik Seti",
    description: "Grup terapisi için etkinlik materyalleri.",
    fileUrl: "/files/grup-terapisi.pdf",
    fileType: "PDF",
    fileSize: 524288,
    downloads: 1560,
    uploaderEmail: "ayse.yilmaz@turkpdr.com",
  },
  {
    id: "seed-file-ogrenci-gorusme",
    title: "Öğrenci Görüşme Kayıt Formu",
    description: "Rehberlik görüşmeleri için kayıt formu.",
    fileUrl: "/files/ogrenci-gorusme.pdf",
    fileType: "PDF",
    fileSize: 163840,
    downloads: 2940,
    uploaderEmail: "mehmet.kaya@turkpdr.com",
  },
  {
    id: "seed-file-aile-danismanligi",
    title: "Aile Danışmanlığı Rehberi",
    description: "Aile danışmanlığı uygulamaları rehber dokümanı.",
    fileUrl: "/files/aile-danismanligi.pdf",
    fileType: "PDF",
    fileSize: 409600,
    downloads: 1240,
    uploaderEmail: "zeynep.arslan@turkpdr.com",
  },
] as const;

async function seedUsers() {
  console.log("👤 Kullanıcılar oluşturuluyor...");

  const userMap = new Map<string, string>();

  for (const user of USERS) {
    const hashedPassword = await hashPassword(user.password);

    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: hashedPassword,
        role: user.role,
        title: user.title,
        bio: user.bio,
        avatar: user.avatar,
        status: UserStatus.ACTIVE,
      },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
        title: user.title,
        bio: user.bio,
        avatar: user.avatar,
        status: UserStatus.ACTIVE,
      },
    });

    userMap.set(user.email, record.id);
    console.log(`  ✓ ${user.name} (${user.role})`);
  }

  return userMap;
}

async function seedCategories() {
  console.log("📁 Kategoriler oluşturuluyor...");

  const categoryMap = new Map<string, string>();

  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        type: category.type,
      },
      create: {
        name: category.name,
        slug: category.slug,
        type: category.type,
      },
    });

    categoryMap.set(category.slug, record.id);
    console.log(`  ✓ ${category.name}`);
  }

  return categoryMap;
}

async function seedTags() {
  console.log("🏷️  Etiketler oluşturuluyor...");

  const tagMap = new Map<string, string>();

  for (const tagName of TAGS) {
    const tagSlug = createSlug(tagName);

    const record = await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: { name: tagName },
      create: { name: tagName, slug: tagSlug },
    });

    tagMap.set(tagName, record.id);
    console.log(`  ✓ ${tagName}`);
  }

  return tagMap;
}

async function seedContents(
  userMap: Map<string, string>,
  categoryMap: Map<string, string>,
  tagMap: Map<string, string>
) {
  console.log("📝 İçerikler oluşturuluyor...");

  for (const item of CONTENTS) {
    const authorId = userMap.get(item.authorEmail);
    const categoryId = categoryMap.get(item.categorySlug);

    if (!authorId || !categoryId) {
      throw new Error(`İçerik için yazar veya kategori bulunamadı: ${item.slug}`);
    }

    const content =
      ARTICLE_CONTENT[item.slug] ??
      `<p>${item.summary}</p>`;

    const record = await prisma.content.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        summary: item.summary,
        content,
        coverImage: item.coverImage,
        type: item.type,
        status: ContentStatus.PUBLISHED,
        featured: item.featured,
        views: item.views,
        authorId,
        categoryId,
        publishedAt: new Date(),
      },
      create: {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content,
        coverImage: item.coverImage,
        type: item.type,
        status: ContentStatus.PUBLISHED,
        featured: item.featured,
        views: item.views,
        authorId,
        categoryId,
        publishedAt: new Date(),
      },
    });

    for (const tagName of item.tags) {
      const tagId = tagMap.get(tagName);
      if (!tagId) continue;

      await prisma.contentTag.upsert({
        where: {
          contentId_tagId: {
            contentId: record.id,
            tagId,
          },
        },
        update: {},
        create: {
          contentId: record.id,
          tagId,
        },
      });
    }

    console.log(`  ✓ ${item.title}`);
  }
}

async function seedTests(categoryMap: Map<string, string>) {
  console.log("🧪 Testler oluşturuluyor...");

  for (const test of TESTS) {
    const categoryId = categoryMap.get(test.categorySlug);

    await prisma.test.upsert({
      where: { slug: test.slug },
      update: {
        title: test.title,
        description: test.description,
        image: test.image,
        duration: test.duration,
        questionCount: test.questionCount,
        categoryId,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        title: test.title,
        slug: test.slug,
        description: test.description,
        image: test.image,
        duration: test.duration,
        questionCount: test.questionCount,
        categoryId,
        status: ContentStatus.PUBLISHED,
      },
    });

    console.log(`  ✓ ${test.title}`);
  }
}

const SAMPLE_TEST_QUESTIONS = [
  {
    text: "Son iki haftadır kendimi üzgün veya mutsuz hissettim.",
    options: [
      { text: "Hiç", score: 0 },
      { text: "Bazen", score: 1 },
      { text: "Sık sık", score: 2 },
      { text: "Her zaman", score: 3 },
    ],
  },
  {
    text: "Geleceğe dair umutsuzluk hissettim.",
    options: [
      { text: "Hiç", score: 0 },
      { text: "Bazen", score: 1 },
      { text: "Sık sık", score: 2 },
      { text: "Her zaman", score: 3 },
    ],
  },
  {
    text: "Kendimi başarısız veya değersiz hissettim.",
    options: [
      { text: "Hiç", score: 0 },
      { text: "Bazen", score: 1 },
      { text: "Sık sık", score: 2 },
      { text: "Her zaman", score: 3 },
    ],
  },
  {
    text: "Günlük işlerimi yapmakta zorlandım.",
    options: [
      { text: "Hiç", score: 0 },
      { text: "Bazen", score: 1 },
      { text: "Sık sık", score: 2 },
      { text: "Her zaman", score: 3 },
    ],
  },
  {
    text: "Uyku düzenimde belirgin bir değişiklik oldu.",
    options: [
      { text: "Hiç", score: 0 },
      { text: "Bazen", score: 1 },
      { text: "Sık sık", score: 2 },
      { text: "Her zaman", score: 3 },
    ],
  },
] as const;

async function seedTestQuestions() {
  console.log("❓ Test soruları oluşturuluyor...");

  const tests = await prisma.test.findMany({
    select: { id: true, slug: true, title: true },
  });

  for (const test of tests) {
    const existingCount = await prisma.testQuestion.count({
      where: { testId: test.id },
    });

    if (existingCount > 0) {
      console.log(`  ↷ ${test.title} (sorular zaten var)`);
      continue;
    }

    for (const [questionIndex, question] of SAMPLE_TEST_QUESTIONS.entries()) {
      await prisma.testQuestion.create({
        data: {
          testId: test.id,
          text: question.text,
          sortOrder: questionIndex,
          options: {
            create: question.options.map((option, optionIndex) => ({
              text: option.text,
              score: option.score,
              sortOrder: optionIndex,
            })),
          },
        },
      });
    }

    await prisma.test.update({
      where: { id: test.id },
      data: { questionCount: SAMPLE_TEST_QUESTIONS.length },
    });

    console.log(`  ✓ ${test.title} (${SAMPLE_TEST_QUESTIONS.length} soru)`);
  }
}

async function seedFiles(userMap: Map<string, string>) {
  console.log("📄 Dosyalar oluşturuluyor...");

  for (const file of FILES) {
    const uploadedById = userMap.get(file.uploaderEmail);

    if (!uploadedById) {
      throw new Error(`Dosya için yükleyici bulunamadı: ${file.title}`);
    }

    await prisma.fileAsset.upsert({
      where: { id: file.id },
      update: {
        title: file.title,
        description: file.description,
        fileUrl: file.fileUrl,
        fileType: file.fileType,
        fileSize: file.fileSize,
        downloads: file.downloads,
        status: ContentStatus.PUBLISHED,
        uploadedById,
      },
      create: {
        id: file.id,
        title: file.title,
        description: file.description,
        fileUrl: file.fileUrl,
        fileType: file.fileType,
        fileSize: file.fileSize,
        downloads: file.downloads,
        status: ContentStatus.PUBLISHED,
        uploadedById,
      },
    });

    console.log(`  ✓ ${file.title}`);
  }
}

async function main() {
  console.log("🌱 TürkPDR seed başlatılıyor...\n");

  const userMap = await seedUsers();
  const categoryMap = await seedCategories();
  const tagMap = await seedTags();
  await seedContents(userMap, categoryMap, tagMap);
  await seedTests(categoryMap);
  await seedTestQuestions();
  await seedFiles(userMap);

  console.log("\n✅ Seed tamamlandı!");
  console.log("\n📋 Giriş bilgileri:");
  console.log("  Admin  → admin@turkpdr.com / 123456");
  console.log("  Editor → editor@turkpdr.com / 123456");
}

main()
  .catch((error) => {
    console.error("❌ Seed hatası:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
