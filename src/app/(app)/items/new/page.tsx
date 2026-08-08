import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ItemForm } from "@/components/features/item/ItemForm";
import { auth } from "@/lib/auth";

import { createItemAction } from "./actions";
import styles from "./page.module.css";

export default async function NewItemPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href="/wardrobe">
          ワードローブに戻る
        </Link>
        <h1 className={styles.title}>アイテムを登録</h1>
      </div>
      <ItemForm
        onSubmitAction={createItemAction}
        submitLabel="登録する"
        pendingLabel="登録中..."
        redirectTo="/wardrobe"
      />
    </div>
  );
}
