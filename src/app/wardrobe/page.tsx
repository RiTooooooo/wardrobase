import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import { auth } from "@/lib/auth";

import styles from "./page.module.css";

export default async function WardrobePage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  // proxy.ts の振り分けは Cookie の有無しか見ていないため、ここで実際に検証する
  if (session === null) {
    redirect("/login");
  }

  const items = await findItemsByUser(session.user.id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>ワードローブ</h1>
          <span className={styles.count}>{items.length} items</span>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.addButton} href="/items/new">
            アイテムを追加
          </Link>
          <SignOutButton />
        </div>
      </header>
      {items.length === 0 ? (
        <p className={styles.empty}>
          アイテムがまだ登録されていません。
          <Link className={styles.emptyLink} href="/items/new">
            最初の1着を登録する
          </Link>
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.listItem}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemBrand}>{item.brand ?? "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
