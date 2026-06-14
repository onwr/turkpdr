"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { canAccessAdmin } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/auth/types";

type AccountSettingsPanelProps = {
  user: AuthUser;
  memberSince: string;
};

const roleLabels: Record<string, string> = {
  ADMIN: "Yönetici",
  EDITOR: "Editör",
  AUTHOR: "Yazar",
  MEMBER: "Üye",
};

export function AccountSettingsPanel({
  user,
  memberSince,
}: AccountSettingsPanelProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-brand-blue" />
            Hesap Bilgileri
          </CardTitle>
          <CardDescription>
            Temel hesap bilgileriniz ve üyelik durumu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <span className="text-muted-foreground">Ad Soyad</span>
            <span className="font-medium text-brand-navy">{user.name}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <span className="text-muted-foreground">E-posta</span>
            <span className="font-medium text-brand-navy">{user.email}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
            <span className="text-muted-foreground">Rol</span>
            <span className="font-medium text-brand-navy">
              {roleLabels[user.role] ?? user.role}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Üyelik Tarihi</span>
            <span className="font-medium text-brand-navy">{memberSince}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Hızlı Bağlantılar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/hesabim/profil">Profili Düzenle</Link>
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href={`/profil/${user.id}`}>Profilimi Görüntüle</Link>
          </Button>
          {canAccessAdmin(user.role) && (
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/admin">Yönetim Paneli</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Oturum</CardTitle>
          <CardDescription>Hesabınızdan güvenli çıkış yapın.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Çıkış Yap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
