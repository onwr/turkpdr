import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth/types";

type AccountHeaderProps = {
  user: AuthUser;
  title: string;
  description?: string;
};

export function AccountHeader({
  user,
  title,
  description,
}: AccountHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-blue">Hesabım</p>
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <Button variant="outline" className="rounded-xl shrink-0" asChild>
        <Link href={`/profil/${user.id}`}>
          <ExternalLink className="size-4" />
          Profilimi Görüntüle
        </Link>
      </Button>
    </div>
  );
}
