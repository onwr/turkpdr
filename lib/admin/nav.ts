import type { AdminNavItem, QuickAction } from "@/types/admin";

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
  { label: "Aktivite Geçmişi", href: "/admin/activity", icon: "activity" },
  { label: "Çöp Kutusu", href: "/admin/trash", icon: "trash" },
  { label: "İçerikler", href: "/admin/contents", icon: "content" },
  { label: "Kategoriler", href: "/admin/categories", icon: "categories" },
  { label: "Haberler", href: "/admin/news", icon: "news" },
  { label: "Psiko Sanat", href: "/admin/psiko-sanat", icon: "psikoSanat" },
  { label: "Makaleler", href: "/admin/contents?type=ARTICLE", icon: "articles" },
  { label: "Dosyalar", href: "/admin/files", icon: "files" },
  { label: "Medya Kütüphanesi", href: "/admin/media", icon: "media" },
  { label: "Videolar", href: "/admin/contents?type=VIDEO", icon: "videos" },
  { label: "Test Merkezi", href: "/admin/tests", icon: "tests" },
  { label: "Sözlük", href: "/admin/dictionary", icon: "dictionary" },
  { label: "Yazarlar", href: "/admin/authors", icon: "authors" },
  { label: "Üyeler", href: "/admin/users", icon: "members" },
  { label: "Yorumlar", href: "/admin/comments", icon: "comments" },
  { label: "Ayarlar", href: "/admin/settings", icon: "settings" },
];

function navItemMatches(
  item: AdminNavItem,
  pathname: string,
  searchParams: URLSearchParams
): boolean {
  const [hrefPath, hrefQuery] = item.href.split("?");

  if (item.href === "/admin") {
    return pathname === "/admin";
  }

  const pathMatches =
    pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  if (!pathMatches) return false;

  if (hrefQuery) {
    const expected = new URLSearchParams(hrefQuery);
    for (const [key, value] of expected.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return pathname === hrefPath;
  }

  if (hrefPath === "/admin/contents" && searchParams.has("type")) {
    return false;
  }

  return true;
}

export function getAdminActiveHref(
  pathname: string,
  search: string
): string | null {
  const searchParams = new URLSearchParams(search);
  const matches = adminNavItems.filter((item) =>
    navItemMatches(item, pathname, searchParams)
  );

  if (matches.length === 0) return null;

  return matches.sort((a, b) => b.href.length - a.href.length)[0].href;
}

export const quickActions: QuickAction[] = [
  {
    id: "article",
    label: "Yeni Makale",
    description: "Yeni makale oluştur ve yayınla",
    href: "/admin/contents/new",
    icon: "article",
  },
  {
    id: "news",
    label: "Yeni Haber",
    description: "Haber ekle ve duyuru yap",
    href: "/admin/news/new",
    icon: "news",
  },
  {
    id: "file",
    label: "Dosya Yükle",
    description: "PDF veya doküman yükle",
    href: "/admin/files/new",
    icon: "file",
  },
  {
    id: "test",
    label: "Test Ekle",
    description: "Yeni psikolojik test ekle",
    href: "/admin/tests/new",
    icon: "test",
  },
  {
    id: "dictionary",
    label: "Sözlük Terimi",
    description: "Yeni sözlük terimi ekle",
    href: "/admin/dictionary/new",
    icon: "dictionary",
  },
];
