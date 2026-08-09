import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/*
 * ルートは入口へ送るだけ。
 *
 * 未ログインなら /login。ログイン画面はロゴ・キャッチコピー・新規登録への導線を
 * すべて備えているため、その手前に同じ内容の画面を置くと重複するうえ、
 * 「クローゼットを開けるとアプリが始まる」という演出が薄れる。
 */
export default async function Home(): Promise<never> {
  const session = await auth.api.getSession({ headers: await headers() });

  redirect(session === null ? "/login" : "/wardrobe");
}
