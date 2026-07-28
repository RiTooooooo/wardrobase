import type { ReactElement } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { auth } from "@/lib/auth";

import styles from "./page.module.css";

export default async function WardrobePage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  // proxy.ts の振り分けは Cookie の有無しか見ていないため、ここで実際に検証する
  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>ワードローブ</h1>
        <SignOutButton />
      </header>
      <p className={styles.greeting}>{session.user.name} さんのワードローブ</p>
      <p className={styles.empty}>
        アイテムはまだ登録されていません。Week 2 で登録機能を実装します。
      </p>
    </div>
  );
}
