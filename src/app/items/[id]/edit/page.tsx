import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ItemForm } from "@/components/features/item/ItemForm";
import { findItemById } from "@/infrastructure/prisma/itemRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";
import type { CreateItemInput } from "@/schemas/item";

import { updateItemAction } from "../actions";
import styles from "../page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

type ItemRow = NonNullable<Awaited<ReturnType<typeof findItemById>>>;

function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

function toInitialValues(
  item: ItemRow,
  imageUrl: string | undefined,
): CreateItemInput & { imageUrl?: string } {
  return {
    name: item.name,
    category: item.category,
    subCategory: orUndefined(item.subCategory),
    color: item.color as CreateItemInput["color"],
    seasons: item.seasons,
    brand: orUndefined(item.brand),
    price: orUndefined(item.price),
    purchasedAt: orUndefined(item.purchasedAt),
    memo: orUndefined(item.memo),
    imagePath: orUndefined(item.imagePath),
    imageUrl,
  };
}

export default async function EditItemPage({
  params,
}: Props): Promise<ReactElement> {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const item = await findItemById(session.user.id, id);

  if (item === null) {
    notFound();
  }

  const imageUrl = item.imagePath
    ? await createViewUrl(item.imagePath)
    : undefined;

  const initialValues = toInitialValues(item, imageUrl);

  async function handleUpdate(
    data: CreateItemInput,
  ): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
    "use server";
    return updateItemAction(id, data);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href={`/items/${id}`}>
          詳細に戻る
        </Link>
        <h1 className={styles.title}>アイテムを編集</h1>
      </div>
      <ItemForm
        initialValues={initialValues}
        onSubmitAction={handleUpdate}
        submitLabel="保存する"
        pendingLabel="保存中..."
        redirectTo={`/items/${id}`}
      />
    </div>
  );
}
