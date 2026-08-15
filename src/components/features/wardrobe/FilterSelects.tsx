"use client";

import type { ReactElement } from "react";

import { CATEGORIES, CATEGORY_LABELS } from "@/domain/item/category";
import { SEASON_LABELS, SEASONS } from "@/domain/item/season";

import styles from "./FilterSelects.module.css";

/*
 * 狭い画面用の絞り込み。
 *
 * チップのまま並べるとカテゴリ7個・季節4個で縦に4行を占め、
 * アイテムが見えるまで画面の半分近くを使ってしまう。
 * どちらも1つしか選べないのでプルダウンに置き換える。
 *
 * 広い画面ではチップ（一覧できる）を出すため、CSS 側で出し分ける。
 * どちらか一方は display:none になり、支援技術からも操作対象からも外れる。
 */

type Props = {
  category: string | null;
  season: string | null;
  onCategoryChange: (value: string | null) => void;
  onSeasonChange: (value: string | null) => void;
};

/** 「すべて」を表す値。空文字だと未選択と紛らわしいので明示する */
const ALL = "__all__";

function toValue(selected: string | null): string {
  return selected ?? ALL;
}

function fromValue(value: string): string | null {
  return value === ALL ? null : value;
}

export function FilterSelects({
  category,
  season,
  onCategoryChange,
  onSeasonChange,
}: Props): ReactElement {
  return (
    <div className={styles.selects}>
      <label className={styles.field}>
        <span className={styles.label}>カテゴリ</span>
        <select
          className={styles.select}
          value={toValue(category)}
          onChange={(e) => onCategoryChange(fromValue(e.target.value))}
        >
          <option value={ALL}>すべて</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>季節</span>
        <select
          className={styles.select}
          value={toValue(season)}
          onChange={(e) => onSeasonChange(fromValue(e.target.value))}
        >
          <option value={ALL}>すべて</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {SEASON_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
