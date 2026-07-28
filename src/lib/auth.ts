import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/infrastructure/prisma/client";

/**
 * better-auth の設定。
 *
 * スキーマ（Session / Account / Verification）は prisma/schema.prisma に手で定義してある。
 * CLI（`npx auth@latest generate`）は既存スキーマにマージできず上書きしてしまうため使わない。
 * better-auth をアップデートした際は、公式のコアスキーマ定義と差分が無いか確認すること。
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Phase 1 はメール + パスワードのみ。OAuth は Phase 3。
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // 開発中はメール確認を挟まない。本番で有効にする際は Mailpit で確認する。
    requireEmailVerification: false,
  },

  // Server Component / Server Function から Cookie を書けるようにする。
  // Next.js 用のプラグインで、必ず plugins の最後に置く。
  plugins: [nextCookies()],
});
