"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteStylingAction } from "./actions";
import styles from "./page.module.css";

type Props = {
  stylingId: string;
};

export function StylingDetailActions({
  stylingId,
}: Props): ReactElement {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete(): Promise<void> {
    const confirmed = window.confirm(
      "このスタイリングを削除しますか？この操作は取り消せません。",
    );

    if (!confirmed) return;

    setIsPending(true);
    const result = await deleteStylingAction(stylingId);

    if (!result.ok) {
      setIsPending(false);
      window.alert(result.message);
      return;
    }

    router.push("/stylings");
  }

  return (
    <div className={styles.actions}>
      {/* 編集はボードに一本化済み。手段が1つなので但し書きは付けない */}
      <Link
        className={styles.editLink}
        href={`/stylings/${stylingId}/board`}
      >
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
