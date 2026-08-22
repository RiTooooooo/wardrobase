import type { ReactElement } from "react";

import styles from "./OutfitBook.module.css";

/*
 * 開いた本のシルエット。
 *
 * 上辺は各ページの中ほどが山なりに盛り上がり、背（中央）で少し谷になる。
 * 下辺は外側へ膨らみ、背の下端がわずかに下へ突き出る。
 * clipPathUnits="objectBoundingBox" なので、参照する要素の大きさに
 * 合わせて伸縮する（表紙にも紙面にも同じ形を使える）。
 */
export function BookSilhouette(): ReactElement {
  return (
    <svg className={styles.silhouetteDefs} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="book-silhouette" clipPathUnits="objectBoundingBox">
          <path d="M0.008,0.05 C0.16,0.014 0.34,0.007 0.485,0.026 L0.5,0.035 L0.515,0.026 C0.66,0.007 0.84,0.014 0.992,0.05 L0.992,0.95 C0.84,0.984 0.66,0.991 0.52,0.968 L0.5,0.986 L0.48,0.968 C0.34,0.991 0.16,0.984 0.008,0.95 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
