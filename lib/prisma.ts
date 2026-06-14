import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  schemaFingerprint?: string;
};

function getSchemaFingerprint(): string {
  const user = Prisma.dmmf.datamodel.models.find((model) => model.name === "User");
  return user?.fields.map((field) => field.name).sort().join(",") ?? "";
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
  }

  const pool =
    globalForPrisma.pgPool ?? new Pool({ connectionString });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

function isClientUpToDate(client: PrismaClient): boolean {
  const c = client as unknown as {
    siteSettings?: unknown;
    notification?: unknown;
    dictionaryTerm?: unknown;
    messageConversationState?: unknown;
  };
  return (
    c.siteSettings !== undefined &&
    c.notification !== undefined &&
    c.dictionaryTerm !== undefined &&
    c.messageConversationState !== undefined
  );
}

function getPrismaClient(): PrismaClient {
  const schemaFingerprint = getSchemaFingerprint();
  const cached = globalForPrisma.prisma;

  if (
    cached &&
    globalForPrisma.schemaFingerprint === schemaFingerprint &&
    isClientUpToDate(cached)
  ) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.schemaFingerprint = schemaFingerprint;
  }

  return client;
}

export const prisma = getPrismaClient();
