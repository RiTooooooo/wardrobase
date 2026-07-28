"use client";

import { createAuthClient } from "better-auth/react";

/**
 * ブラウザから呼ぶ認証クライアント。
 *
 * better-auth のクライアントメソッドはサーバー側から呼んではいけない。
 * サーバーでセッションを取るときは `auth.api.getSession()` を使う（conventions.md §5）。
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
