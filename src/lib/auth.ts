import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/infrastructure/prisma/client";
import { isDemoEmail } from "@/lib/demo";

/**
 * デモアカウントに許可しない認証エンドポイント。
 *
 * デモは閲覧専用（Server Function 側は requireWritableUserId が守る）だが、
 * 認証 API を直接叩けばパスワード変更などでデモを乗っ取れてしまうため、
 * アカウント自体を変更する操作をここで塞ぐ。
 */
const DEMO_BLOCKED_AUTH_PATHS = new Set([
  "/change-password",
  "/set-password",
  "/change-email",
  "/update-user",
  "/delete-user",
]);

const demoWriteGuard = createAuthMiddleware(async (ctx) => {
  if (!DEMO_BLOCKED_AUTH_PATHS.has(ctx.path)) return;

  const session = await getSessionFromCtx(ctx);

  if (session !== null && isDemoEmail(session.user.email)) {
    throw new APIError("FORBIDDEN", {
      message: "デモアカウントでは利用できない操作です",
    });
  }
});

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
    // サインアップは本番では封じる（自分専用アプリのため）。
    // 本人のアカウント作成時のみ Vercel 側で一時的に false にする。
    disableSignUp: process.env.AUTH_DISABLE_SIGNUP === "true",
    // サインアップを封じているため他人のメールアドレスでの登録経路が無く、
    // メール確認は導入しない（導入するならメール送信基盤が先）。
    requireEmailVerification: false,
  },

  // 認証エンドポイントの総当たり対策。
  // サーバーレスではインスタンスごとのメモリ保存なので完全ではないが、
  // 単一インスタンスからの連打は抑止できる。
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },

  hooks: {
    before: demoWriteGuard,
  },

  // Server Component / Server Function から Cookie を書けるようにする。
  // Next.js 用のプラグインで、必ず plugins の最後に置く。
  plugins: [nextCookies()],
});
