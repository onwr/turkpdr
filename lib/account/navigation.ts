import {
  Bookmark,
  Bell,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  ClipboardList,
} from "lucide-react";

export const ACCOUNT_NAV = [
  { href: "/hesabim", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/hesabim/paylasimlar", label: "Paylaşımlarım", icon: FileText },
  { href: "/hesabim/paylasimlar/yeni", label: "Yeni Paylaşım", icon: PlusCircle },
  { href: "/hesabim/favoriler", label: "Favorilerim", icon: Bookmark },
  {
    href: "/hesabim/test-sonuclarim",
    label: "Test Sonuçlarım",
    icon: ClipboardList,
  },
  { href: "/hesabim/dosyalar", label: "Dosyalarım", icon: FolderOpen },
  { href: "/hesabim/mesajlar", label: "Mesajlarım", icon: MessageSquare },
  { href: "/hesabim/bildirimler", label: "Bildirimlerim", icon: Bell },
  { href: "/hesabim/profil", label: "Profilim", icon: User },
  { href: "/hesabim/ayarlar", label: "Ayarlar", icon: Settings },
] as const;
