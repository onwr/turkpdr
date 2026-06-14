"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";

type MessageUserButtonProps = {
  profileId: string;
  currentUserId?: string | null;
};

export function MessageUserButton({
  profileId,
  currentUserId,
}: MessageUserButtonProps) {
  if (!currentUserId || currentUserId === profileId) {
    return null;
  }

  return (
    <Button
      className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
      asChild
    >
      <Link href={`/mesajlar/${profileId}`}>
        <MessageSquare className="size-4" />
        Mesaj Gönder
      </Link>
    </Button>
  );
}
