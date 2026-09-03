import type { ReactElement } from "react";

import styles from "./loading.module.css";

/*
 * ページ遷移中の表示。ヘッダーとボトムナビはレイアウト側に残るため、
 * ここはコンテンツ領域だけを受け持つ。
 *
 * スケルトンは使わない方針（偽物のちらつきを見せない）。
 * スピナーは CSS の animation-delay で 300ms 経ってから現れるので、
 * 速い遷移では何も見えず、待たされたときだけ「処理中」と分かる。
 */
export default function AppLoading(): ReactElement {
  return (
    <div className={styles.wrap} role="status" aria-label="読み込み中">
      <span className={styles.spinner} />
    </div>
  );
}
