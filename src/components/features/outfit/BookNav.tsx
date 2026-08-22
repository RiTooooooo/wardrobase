import type { ReactElement } from "react";

import styles from "./OutfitBook.module.css";

/* 本の下のページ送り。ボタン2つとノンブル（ページ番号） */
export function BookNav({
  current,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}): ReactElement {
  return (
    <div className={styles.nav}>
      <button
        type="button"
        className={styles.navButton}
        disabled={!canPrev}
        onClick={onPrev}
      >
        前のページ
      </button>
      <span className={styles.pageNumber}>
        {current + 1} / {total}
      </span>
      <button
        type="button"
        className={styles.navButton}
        disabled={!canNext}
        onClick={onNext}
      >
        次のページ
      </button>
    </div>
  );
}
