"use client";

import type { ReactElement } from "react";

import styles from "./StylingPicker.module.css";

/*
 * 保存済みスタイリングから、その日の記録を起こす。
 *
 * 選ぶとアイテムが選択欄に写る。**参照ではなくコピー**なのは、
 * あとからスタイリングを編集しても過去の実績が書き換わらないようにするため
 * （spec.md「スタイリングから着用を記録する際はコピーで実績を作る」）。
 * 写したあとは自由に足し引きできる。
 */

export type StylingChoice = {
  id: string;
  name: string;
  itemIds: string[];
};

type Props = {
  stylings: StylingChoice[];
  disabled: boolean;
  onApply: (itemIds: string[]) => void;
};

export function StylingPicker({
  stylings,
  disabled,
  onApply,
}: Props): ReactElement | null {
  /* 1つも保存していないうちは、選ぶものが無いので出さない */
  if (stylings.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>スタイリングから選ぶ</span>
      <div className={styles.list}>
        {stylings.map((styling) => (
          <button
            key={styling.id}
            type="button"
            className={styles.choice}
            disabled={disabled}
            onClick={() => onApply(styling.itemIds)}
          >
            <span className={styles.name}>{styling.name}</span>
            <span className={styles.count}>{styling.itemIds.length}点</span>
          </button>
        ))}
      </div>
    </div>
  );
}
