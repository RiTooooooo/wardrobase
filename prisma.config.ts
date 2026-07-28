import "dotenv/config";

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 から、接続URLは schema.prisma の datasource ではなく
 * このファイルで指定する（`url = env("DATABASE_URL")` は廃止）。
 *
 * `.env` の読み込みも自動では行われないため、dotenv を明示的に import している。
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
