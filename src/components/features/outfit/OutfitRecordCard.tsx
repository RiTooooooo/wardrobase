import { ViewTransition } from "react";
import type { ReactElement } from "react";

import Link from "next/link";

import { FadeInImage } from "@/components/ui/FadeInImage";
import { IconChevronRight } from "@/components/ui/icons";

import styles from "./OutfitTimeline.module.css";
import type { OutfitEntry, ThumbItem } from "./timelineTypes";

/*
 * タイムラインの1記録。写真数枚とメモ1行だけの静かなカード。
 * お気に入り度・天気は詳細ページに任せる。
 */
export function OutfitRecordCard({
  entry,
}: {
  entry: OutfitEntry;
}): ReactElement {
  return (
    <Link href={`/outfits/${entry.id}`} className={styles.record}>
      <Thumbs outfitId={entry.id} items={entry.items} />
      <span className={styles.memo}>{entry.memo}</span>
      <span className={styles.chev} aria-hidden="true">
        <IconChevronRight />
      </span>
    </Link>
  );
}

/*
 * 「+N」に畳まず全点を並べる。カードは全幅なので横に余裕があり、
 * 収まらない枚数になったら折り返す（.thumbs の flex-wrap）。
 *
 * 各写真は詳細ページの同じ写真へモーフする。遷移名は同じ服が
 * 別の日の記録にも並ぶため、記録IDを含めて画面内で一意にする
 * （詳細ページ側の OutfitItems と揃えること）。
 */
function Thumbs({
  outfitId,
  items,
}: {
  outfitId: string;
  items: ThumbItem[];
}): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <div className={styles.thumbs}>
      {items.map((item) => (
        <ViewTransition
          key={item.id}
          name={`outfit-${outfitId}-item-${item.id}`}
          share="morph"
        >
          <div className={styles.thumb}>
            {item.imageUrl ? (
              <FadeInImage
                className={styles.thumbImage}
                src={item.imageUrl}
                alt={item.name}
              />
            ) : (
              <span className={styles.thumbName}>{item.name}</span>
            )}
          </div>
        </ViewTransition>
      ))}
    </div>
  );
}
