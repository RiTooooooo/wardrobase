import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { BoardItem, DrawerItem } from "@/components/features/board/boardTypes";
import { StylingBoard } from "@/components/features/board/StylingBoard";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import type { StylingWithItems } from "@/infrastructure/prisma/stylingRepository";
import { findStylingById } from "@/infrastructure/prisma/stylingRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import { updateStylingBoardAction } from "./actions";

import styles from "../../board/new/page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

function toBoardItems(styling: StylingWithItems): BoardItem[] {
  return styling.items.map((si, i) => ({
    itemId: si.itemId,
    x: si.positionX ?? i * 110,
    y: si.positionY ?? 0,
    zIndex: si.zIndex,
  }));
}

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

export default async function EditBoardPage({
  params,
}: Props): Promise<ReactElement> {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const styling = await findStylingById(session.user.id, id);

  if (styling === null) {
    notFound();
  }

  const allItems = await findItemsByUser(session.user.id);
  const drawerItems = await Promise.all(allItems.map(toDrawerItem));

  async function handleUpdate(
    data: unknown,
  ): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
    "use server";
    return updateStylingBoardAction(id, data);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href={`/stylings/${id}`}>
          詳細に戻る
        </Link>
        <h1 className={styles.title}>スタイリングボード</h1>
      </div>
      <StylingBoard
        drawerItems={drawerItems}
        initialBoardItems={toBoardItems(styling)}
        initialName={styling.name}
        initialSeasons={styling.seasons}
        initialMemo={orUndefined(styling.memo)}
        onSubmitAction={handleUpdate}
        redirectTo={`/stylings/${id}`}
      />
    </div>
  );
}
