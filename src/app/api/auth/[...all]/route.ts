import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

/**
 * better-auth のエンドポイント。
 * /api/auth/* への GET / POST をすべて better-auth に委譲する。
 */
export const { GET, POST } = toNextJsHandler(auth);
