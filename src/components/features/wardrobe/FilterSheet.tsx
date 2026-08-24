"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import { SeasonChips, SortSelect } from "./FilterControls";
import styles from "./FilterSheet.module.css";
import type { WardrobeFilters as Filters } from "./wardrobeTypes";

/*
 * 狭い画面用の絞り込み。
 *
 * 季節・検索・並び替えを縦に3段並べると、クローゼットが
 * 画面の下に追いやられてしまう。操作を「絞り込み・並び替え」
 * ボタン1つに畳み、タップで下からシートを引き出す。
 * （クローゼットの引き出しを開ける所作に揃えた）
 *
 * 広い画面ではチップ列（WardrobeFilters 側）を出すため、CSS で隠れる。
 */

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

/** 既定値から変わっている条件の数。トリガーに表示して状態を見せる */
function activeCount(filters: Filters): number {
  let count = 0;
  if (filters.season !== null) count += 1;
  if (filters.query !== "") count += 1;
  if (filters.sort !== "createdAt-desc") count += 1;
  return count;
}

export function FilterSheet({ filters, onChange }: Props): ReactElement {
  const [open, setOpen] = useState(false);

  // シートの背後で本文がスクロールしないよう固定する
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return (): void => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const count = activeCount(filters);

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span>絞り込み・並び替え</span>
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </button>
      {open && (
        <div className={styles.overlay}>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="閉じる"
            onClick={() => setOpen(false)}
          />
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="絞り込みと並び替え"
          >
            <div className={styles.handle} aria-hidden="true" />
            <div className={styles.section}>
              <span className={styles.label}>季節</span>
              <SeasonChips
                selected={filters.season}
                onSelect={(season) => onChange({ ...filters, season })}
              />
            </div>
            <div className={styles.section}>
              <span className={styles.label}>検索</span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="ブランド・メモで検索"
                value={filters.query}
                onChange={(e) => onChange({ ...filters, query: e.target.value })}
              />
            </div>
            <div className={styles.section}>
              <span className={styles.label}>並び替え</span>
              <SortSelect
                value={filters.sort}
                onChange={(sort) => onChange({ ...filters, sort })}
              />
            </div>
            <button
              type="button"
              className={styles.done}
              onClick={() => setOpen(false)}
            >
              完了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
