"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteOutfitAction } from "./actions";
import styles from "./page.module.css";

type Props = {
  outfitId: string;
};

export function OutfitDetailActions({ outfitId }: Props): ReactElement {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete(): Promise<void> {
    const confirmed = window.confirm(
      "このコーデ記録を削除しますか？この操作は取り消せません。",
    );

    if (!confirmed) return;

    setIsPending(true);
    const result = await deleteOutfitAction(outfitId);

    if (!result.ok) {
      setIsPending(false);
      window.alert(result.message);
      return;
    }

    /* 削除したらコーデ記録の一覧へ戻す（詳細はもう無い） */
    router.push("/outfits");
  }

  return (
    <div className={styles.actions}>
      <Link className={styles.editLink} href={`/outfits/${outfitId}/edit`}>
        編集する
      </Link>
      <button
        type="button"
        className={styles.deleteButton}
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? "削除中..." : "削除する"}
      </button>
    </div>
  );
}
