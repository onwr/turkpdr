import { TestQuestionsPage } from "@/components/admin/tests/test-questions-page";
import { requireAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminTestQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  return <TestQuestionsPage testId={id} />;
}
