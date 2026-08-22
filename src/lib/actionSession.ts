import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isDemoEmail } from "@/lib/demo";

/**
 * 書き込み系 Server Function の共通ガード。
 *
 * 未ログインに加えて、デモアカウント（ポートフォリオ閲覧用）を弾く。
 * デモは DEMO_USER_EMAIL で指定し、閲覧のみ許可する。
 */

type Failure = { ok: false; message: string };

export async function requireWritableUserId(): Promise<
  { userId: string } | { error: Failure }
> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { error: { ok: false, message: "ログインが必要です" } };
  }

  if (isDemoEmail(session.user.email)) {
    return {
      error: { ok: false, message: "デモアカウントでは閲覧のみ利用できます" },
    };
  }

  return { userId: session.user.id };
}
