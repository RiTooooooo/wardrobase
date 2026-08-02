import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { WardrobeGrid } from "@/components/features/wardrobe/WardrobeGrid";
import type { WardrobeItem } from "@/components/features/wardrobe/wardrobeTypes";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import styles from "./page.module.css";

async function toWardrobeItem(
  item: Awaited<ReturnType<typeof findItemsByUser>>[number],
): Promise<WardrobeItem> {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
    seasons: item.seasons,
    brand: item.brand,
    price: item.price,
    memo: item.memo,
    imageUrl: item.imagePath ? await createViewUrl(item.imagePath) : null,
    createdAt: item.createdAt.toISOString(),
  };
}

export default async function WardrobePage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const items = await findItemsByUser(session.user.id);
  const wardrobeItems = await Promise.all(items.map(toWardrobeItem));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>ワードローブ</h1>
          <span className={styles.count}>{items.length} items</span>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.addButton} href="/outfits/new">
            コーデを記録
          </Link>
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
        <WardrobeGrid items={wardrobeItems} />
      )}
    </div>
  );
}
