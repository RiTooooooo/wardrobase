import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OutfitForm } from "@/components/features/outfit/OutfitForm";
import type { PickerItem } from "@/components/features/outfit/outfitTypes";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import { createOutfitAction } from "./actions";
import styles from "./page.module.css";

async function toPickerItem(
  item: Awaited<ReturnType<typeof findItemsByUser>>[number],
): Promise<PickerItem> {
  return {
    id: item.id,
    name: item.name,
    imageUrl: item.imagePath ? await createViewUrl(item.imagePath) : null,
    category: item.category,
  };
}

export default async function NewOutfitPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const items = await findItemsByUser(session.user.id);
  const pickerItems = await Promise.all(items.map(toPickerItem));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href="/wardrobe">
          ワードローブに戻る
        </Link>
        <h1 className={styles.title}>コーデを記録</h1>
      </div>
      <OutfitForm
        items={pickerItems}
        onSubmitAction={createOutfitAction}
        submitLabel="記録する"
        pendingLabel="記録中..."
        redirectTo="/outfits/:id"
      />
    </div>
  );
}
