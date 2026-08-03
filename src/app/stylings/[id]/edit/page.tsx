import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { PickerItem } from "@/components/features/outfit/outfitTypes";
import { StylingForm } from "@/components/features/styling/StylingForm";
import type { StylingFormValues } from "@/components/features/styling/stylingTypes";
import { findItemsByUser } from "@/infrastructure/prisma/itemRepository";
import type { StylingWithItems } from "@/infrastructure/prisma/stylingRepository";
import { findStylingById } from "@/infrastructure/prisma/stylingRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";
import type { CreateStylingInput } from "@/schemas/styling";

import { updateStylingAction } from "../actions";
import styles from "../page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

function toInitialValues(styling: StylingWithItems): StylingFormValues {
  return {
    name: styling.name,
    itemIds: styling.items.map((si) => si.itemId),
    seasons: styling.seasons,
    memo: orUndefined(styling.memo),
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

export default async function EditStylingPage({
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
  const pickerItems = await Promise.all(allItems.map(toPickerItem));
  const initialValues = toInitialValues(styling);

  async function handleUpdate(
    data: CreateStylingInput,
  ): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
    "use server";
    return updateStylingAction(id, data);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href={`/stylings/${id}`}>
          詳細に戻る
        </Link>
        <h1 className={styles.title}>スタイリングを編集</h1>
      </div>
      <StylingForm
        items={pickerItems}
        initialValues={initialValues}
        onSubmitAction={handleUpdate}
        submitLabel="保存する"
        pendingLabel="保存中..."
        redirectTo={`/stylings/${id}`}
      />
    </div>
  );
}
