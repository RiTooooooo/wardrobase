import "dotenv/config";

import { defineConfig } from "prisma/config";

// CI では DB 不要な prisma generate だけ走るため、未定義時はダミー値で通す
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
