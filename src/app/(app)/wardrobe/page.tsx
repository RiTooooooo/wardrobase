import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { WardrobeView } from "@/components/features/wardrobe/WardrobeView";
import type { WardrobeItem } from "@/components/features/wardrobe/wardrobeTypes";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Fab } from "@/components/ui/Fab";
import { PageTitle } from "@/components/ui/PageTitle";
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
      {items.length === 0 ? <EmptyState /> : (
        <WardrobeView items={wardrobeItems} />
      )}
      <Fab href="/items/new" label="アイテムを追加" />
    </div>
  );
}

function EmptyState(): ReactElement {
  return (
    <>
      <PageTitle
        title="Wardrobe"
        subtitle="全0点のアイテム"
        actions={
          <ButtonLink href="/items/new" narrowHidden>
            アイテムを追加
          </ButtonLink>
        }
      />
      <p className={styles.empty}>
        アイテムがまだ登録されていません。
        <Link className={styles.emptyLink} href="/items/new">
          最初の1着を登録する
        </Link>
      </p>
    </>
  );
}
