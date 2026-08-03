import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { PickerItem } from "@/components/features/outfit/outfitTypes";
import { StylingForm } from "@/components/features/styling/StylingForm";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import { createStylingAction } from "./actions";
import styles from "./page.module.css";

async function toPickerItem(
  item: Awaited<ReturnType<typeof findItemsByUser>>[number],
): Promise<PickerItem> {
  return {
    id: item.id,
    name: item.name,
    imageUrl: item.imagePath ? await createViewUrl(item.imagePath) : null,
  };
}

export default async function NewStylingPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const items = await findItemsByUser(session.user.id);
  const pickerItems = await Promise.all(items.map(toPickerItem));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href="/stylings">
          スタイリング一覧に戻る
        </Link>
        <h1 className={styles.title}>スタイリングを登録</h1>
      </div>
      <StylingForm
        items={pickerItems}
        onSubmitAction={createStylingAction}
        submitLabel="登録する"
        pendingLabel="登録中..."
        redirectTo="/stylings/:id"
      />
    </div>
  );
}
