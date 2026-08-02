import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OutfitForm } from "@/components/features/outfit/OutfitForm";
import type { PickerItem } from "@/components/features/outfit/outfitTypes";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import type { OutfitWithItems } from "@/infrastructure/prisma/outfitRepository";
import { findOutfitById } from "@/infrastructure/prisma/outfitRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";
import type { CreateOutfitInput } from "@/schemas/outfit";

import { updateOutfitAction } from "../actions";
import styles from "../page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

function toInitialValues(
  outfit: OutfitWithItems,
): {
  wornOn: string;
  itemIds: string[];
  satisfaction?: number;
  weather?: string;
  memo?: string;
} {
  return {
    wornOn: outfit.wornOn.toISOString().split("T")[0],
    itemIds: outfit.items.map((oi) => oi.itemId),
    satisfaction: orUndefined(outfit.satisfaction),
    weather: orUndefined(outfit.weather),
    memo: orUndefined(outfit.memo),
  };
}

async function toPickerItem(
  item: Awaited<ReturnType<typeof findItemsByUser>>[number],
): Promise<PickerItem> {
  return {
    id: item.id,
    name: item.name,
    imageUrl: item.imagePath ? await createViewUrl(item.imagePath) : null,
  };
}

export default async function EditOutfitPage({
  params,
}: Props): Promise<ReactElement> {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const outfit = await findOutfitById(session.user.id, id);

  if (outfit === null) {
    notFound();
  }

  const allItems = await findItemsByUser(session.user.id);
  const pickerItems = await Promise.all(allItems.map(toPickerItem));
  const initialValues = toInitialValues(outfit);

  async function handleUpdate(
    data: CreateOutfitInput,
  ): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
    "use server";
    return updateOutfitAction(id, data);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href={`/outfits/${id}`}>
          詳細に戻る
        </Link>
        <h1 className={styles.title}>コーデを編集</h1>
      </div>
      <OutfitForm
        items={pickerItems}
        initialValues={initialValues}
        onSubmitAction={handleUpdate}
        submitLabel="保存する"
        pendingLabel="保存中..."
        redirectTo={`/outfits/${id}`}
      />
    </div>
  );
}
