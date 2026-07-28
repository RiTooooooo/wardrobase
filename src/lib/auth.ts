import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/infrastructure/prisma/client";

/**
 * better-auth の設定。
 *
 * このファイルの場所は CLI（`npx auth@latest generate`）が探す既定パスのひとつ。
 * スキーマを再生成するときは、このファイルを起点に Session / Account / Verification が
 * prisma/schema.prisma へ追記される。生成結果は必ず差分を確認すること。
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Phase 1 はメール + パスワードのみ。OAuth は Phase 3。
  emailAndPassword: {
    enabled: true,
    // 開発中は Mailpit（http://localhost:8025）に届く。
    // 本番で有効にする際はメール送信の実装が必要。
    requireEmailVerification: false,
  },
});
