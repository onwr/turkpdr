import type { ContentType } from "@prisma/client";

import { ContentsListPage } from "@/components/admin/contents/contents-list-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_TYPES: ContentType[] = [
  "NEWS",
  "ARTICLE",
  "GUIDE",
  "METAPHOR",
  "PSIKO_SANAT",
  "VIDEO",
  "FILE",
];

type PageProps = {
  searchParams: Promise<{ type?: string; authorId?: string }>;
};

export default async function AdminContentsPage({ searchParams }: PageProps) {
  const user = await requireAdminAccess();
  const params = await searchParams;
  const typeParam = params.type?.toUpperCase();
  const initialType = VALID_TYPES.includes(typeParam as ContentType)
    ? (typeParam as ContentType)
    : undefined;
  const initialAuthorId = params.authorId?.trim() || undefined;

  return (
    <ContentsListPage
      userRole={user.role}
      currentUserId={user.id}
      initialType={initialType}
      initialAuthorId={initialAuthorId}
    />
  );
}
