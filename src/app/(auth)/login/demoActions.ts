"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/**
 * デモアカウントでのワンクリックログイン（ポートフォリオ閲覧用）。
 *
 * 認証情報はサーバーの環境変数からのみ読み、クライアントへは渡さない。
 * 書き込みの禁止はここではなく、各 Server Function の
 * requireWritableUserId が担う。
 */

function demoCredentials(): { email: string; password: string } | null {
  const email = process.env.DEMO_USER_EMAIL ?? "";
  const password = process.env.DEMO_USER_PASSWORD ?? "";

  return email === "" || password === "" ? null : { email, password };
}

export async function demoLoginAction(): Promise<void> {
  const credentials = demoCredentials();

  if (credentials === null) return;

  await auth.api.signInEmail({
    body: credentials,
    headers: await headers(),
  });

  redirect("/wardrobe");
}
