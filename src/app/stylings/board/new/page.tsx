import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { DrawerItem } from "@/components/features/board/boardTypes";
import { StylingBoard } from "@/components/features/board/StylingBoard";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import { createStylingBoardAction } from "./actions";
import styles from "./page.module.css";

async function toDrawerItem(
  item: Awaited<ReturnType<typeof findItemsByUser>>[number],
): Promise<DrawerItem> {
  return {
    id: item.id,
    name: item.name,
    imageUrl: item.imagePath ? await createViewUrl(item.imagePath) : null,
    category: item.category,
  };
}

export default async function NewBoardPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const items = await findItemsByUser(session.user.id);
  const drawerItems = await Promise.all(items.map(toDrawerItem));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href="/stylings">
          スタイリング一覧に戻る
        </Link>
        <h1 className={styles.title}>スタイリングボード</h1>
      </div>
      <StylingBoard
        drawerItems={drawerItems}
        onSubmitAction={createStylingBoardAction}
        redirectTo="/stylings/:id"
      />
    </div>
  );
}
