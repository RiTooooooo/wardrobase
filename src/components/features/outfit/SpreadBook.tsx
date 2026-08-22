"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { BookNav } from "./BookNav";
import { BookPage } from "./BookPage";
import { BookSilhouette } from "./BookSilhouette";
import { toSpreads } from "./bookPaging";
import type { Flip, Spread, TurnDirection } from "./bookPaging";
import type { DateGroup } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";

/*
 * 広い画面用の見開き2ページの本。
 *
 * めくりの仕組み:
 * 下に「めくり終わったあとの見開き」を敷き、その上に
 * 表＝今の右ページ / 裏＝次の左ページ を持つ1枚（シート）を重ねて、
 * 背（中央）を軸に回転させる。回転が終わったら状態を確定して
 * シートを取り除く。戻るときは同じシートを逆回転させる。
 */

/* いま見えている左右のページ。めくり中は「めくり終わり側」を下敷きにする */
function visibleGroups(
  spreads: Spread[],
  current: number,
  flip: Flip | null,
): Spread {
  if (flip === null) {
    return spreads[current];
  }
  return {
    left: spreads[flip.base].left,
    right: spreads[flip.base + 1].right,
  };
}

export function sheetClassName(dir: TurnDirection): string {
  const turn = dir === "next" ? styles.sheetTurnNext : styles.sheetTurnPrev;
  return `${styles.sheet} ${turn}`;
}

export function SpreadBook({ groups }: { groups: DateGroup[] }): ReactElement {
  const [current, setCurrent] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);
  const spreads = toSpreads(groups);

  const canPrev = flip === null && current > 0;
  const canNext = flip === null && current < spreads.length - 1;

  function finishFlip(): void {
    if (flip === null) return;
    setCurrent(flip.dir === "next" ? flip.base + 1 : flip.base);
    setFlip(null);
  }

  const shown = visibleGroups(spreads, current, flip);

  return (
    <div className={styles.book}>
      <div className={`${styles.cover} ${styles.coverShaped}`}>
        <BookSilhouette />
        {/* 本の形に切り抜いた表紙と紙面。めくりの3D描画と干渉しないよう
            spread の祖先ではなく、後ろに敷く兄弟レイヤーにしている */}
        <div className={styles.coverShape} aria-hidden="true" />
        <div className={styles.paperShape} aria-hidden="true" />
        <div className={styles.spread}>
          <div className={`${styles.pageSide} ${styles.pageLeft}`}>
            <BookPage groups={shown.left} />
            <button
              type="button"
              className={`${styles.curl} ${styles.curlLeft}`}
              aria-label="前のページへ戻る"
              disabled={!canPrev}
              onClick={() => setFlip({ base: current - 1, dir: "prev" })}
            />
          </div>
          <div className={`${styles.pageSide} ${styles.pageRight}`}>
            <BookPage groups={shown.right} />
            <button
              type="button"
              className={`${styles.curl} ${styles.curlRight}`}
              aria-label="次のページをめくる"
              disabled={!canNext}
              onClick={() => setFlip({ base: current, dir: "next" })}
            />
          </div>
          {flip !== null ? (
            <div
              className={sheetClassName(flip.dir)}
              onAnimationEnd={finishFlip}
              aria-hidden="true"
            >
              <div className={styles.sheetFront}>
                <BookPage groups={spreads[flip.base].right} />
              </div>
              <div className={styles.sheetBack}>
                <BookPage groups={spreads[flip.base + 1].left} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <BookNav
        current={current}
        total={spreads.length}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => setFlip({ base: current - 1, dir: "prev" })}
        onNext={() => setFlip({ base: current, dir: "next" })}
      />
    </div>
  );
}
