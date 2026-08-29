"use client";

import { useEffect, useState } from "react";
import type { AnimationEvent, ReactElement } from "react";

import { BookNav } from "./BookNav";
import { BookPage } from "./BookPage";
import { chunkPages, DAYS_PER_PAGE } from "./bookPaging";
import type { Flip } from "./bookPaging";
import type { DateGroup } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";
import { sheetClassName } from "./SpreadBook";

/*
 * 狭い画面用の1ページ表示。左をリングで綴じたバインダーとして見せる。
 *
 * 見開きにすると1ページの幅が足りないため、1画面に1ページだけを出す。
 * めくりは見開き版と同じシート方式で、ページ全幅の紙が
 * 綴じ（左端のリング）を軸に返る。紙の裏は実物と同じく白紙にする。
 * 折れ目（ドッグイア）は「次へ」の右下だけに置き、
 * 前へ戻るのは下部ナビのボタンが担う（押すと逆回転で紙が戻ってくる）。
 */

/* 綴じリングの数（システム手帳と同じ6穴） */
const RING_COUNT = 6;

/* いま見えているページ。めくり中は「めくり終わり側」を下敷きにする */
function visiblePage(
  pages: DateGroup[][],
  current: number,
  flip: Flip | null,
): DateGroup[] {
  if (flip === null) {
    return pages[current];
  }
  return pages[flip.base + 1];
}

export function SinglePageBook({
  groups,
  focusGroup = null,
}: {
  groups: DateGroup[];
  /** このグループ番号が載っているページを開く（日付検索のジャンプ先） */
  focusGroup?: number | null;
}): ReactElement {
  const [current, setCurrent] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);
  const pages = chunkPages(groups);
  const lastPage = pages.length - 1;

  useEffect(
    function jumpToFocus(): void {
      if (focusGroup === null) return;
      const page = Math.floor(focusGroup / DAYS_PER_PAGE);
      setCurrent(Math.min(page, lastPage));
      setFlip(null);
    },
    [focusGroup, lastPage],
  );

  const canPrev = flip === null && current > 0;
  const canNext = flip === null && current < pages.length - 1;

  function finishFlip(e: AnimationEvent<HTMLDivElement>): void {
    /* シートの中身の animationend もバブリングで届くため、自身の回転完了だけ拾う */
    if (e.target !== e.currentTarget) return;
    if (flip === null) return;
    setCurrent(flip.dir === "next" ? flip.base + 1 : flip.base);
    setFlip(null);
  }

  return (
    <div className={styles.book}>
      <div className={`${styles.cover} ${styles.coverBinder}`}>
        {/* スパイラルのコイル。紙の縁をまたいで外まで巻き込む */}
        <div className={styles.binderRings} aria-hidden="true">
          {Array.from({ length: RING_COUNT }, (_, i) => (
            <span key={i} className={styles.ring} />
          ))}
        </div>
        <div className={`${styles.spread} ${styles.spreadSingle}`}>
          <div className={`${styles.pageSide} ${styles.pageRight}`}>
            <BookPage
              variant="notebook"
              groups={visiblePage(pages, current, flip)}
            />
            {/* 折れ目は「次へ」の右下だけ。前へ戻るのは下のボタンが担う */}
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
              className={`${sheetClassName(flip.dir)} ${styles.sheetFull}`}
              onAnimationEnd={finishFlip}
              aria-hidden="true"
            >
              <div className={styles.sheetFront}>
                <BookPage variant="notebook" groups={pages[flip.base]} />
              </div>
              {/* 紙の裏。実物の紙と同じく白紙 */}
              <div className={styles.sheetBack}>
                <BookPage groups={[]} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <BookNav
        current={current}
        total={pages.length}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => setFlip({ base: current - 1, dir: "prev" })}
        onNext={() => setFlip({ base: current, dir: "next" })}
      />
    </div>
  );
}
