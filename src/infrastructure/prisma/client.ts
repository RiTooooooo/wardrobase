import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * PrismaClient のシングルトン。
 *
 * Prisma 7 から `new PrismaClient()` にドライバアダプタが必須になった。
 * PostgreSQL の場合は `@prisma/adapter-pg` を渡す。
 *
 * 開発時のホットリロードで接続が増え続けるのを防ぐため globalThis にキャッシュする。
 * 他のファイルから `new PrismaClient()` しないこと（conventions.md §7）。
 *
 * このファイルを import してよいのは `infrastructure/` 配下と、
 * アダプタを必要とする `lib/auth.ts` だけ。
 * Server Function やコンポーネントから直接 prisma を触らない（conventions.md §5）。
 */

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url === undefined || url === "") {
    throw new Error(
      "DATABASE_URL が設定されていません。.env を確認してください。",
    );
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
