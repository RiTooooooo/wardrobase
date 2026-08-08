import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import styles from "./page.module.css";

export default async function Home(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session !== null) {
    redirect("/wardrobe");
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        wardro<span className={styles.accent}>base</span>
      </h1>
      <p className={styles.description}>
        自分の&quot;好き&quot;なスタイリングを、蓄積して使い回すためのワードローブ基盤
      </p>
      <div className={styles.actions}>
        <Link className={styles.primaryLink} href="/login">
          ログイン
        </Link>
        <Link className={styles.secondaryLink} href="/signup">
          新規登録
        </Link>
      </div>
    </div>
  );
}
