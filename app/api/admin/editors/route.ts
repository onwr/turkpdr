import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const editors = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      role: { in: ["ADMIN", "EDITOR"] },
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ editors });
}
