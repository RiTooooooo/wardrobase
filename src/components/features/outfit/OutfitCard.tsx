import type { ReactElement } from "react";

import Link from "next/link";

import type { OutfitEntry, ThumbItem } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";

/* ルックブックの1記録。台紙にポラロイド写真とメモが並ぶ */
export function OutfitCard({
  entry,
}: {
  entry: OutfitEntry;
}): ReactElement {
  return (
    <Link href={`/outfits/${entry.id}`} className={styles.card}>
      <CardThumbs items={entry.items} />
      <div className={styles.cardBody}>
        <CardMeta entry={entry} />
        {entry.memo !== null ? (
          <span className={styles.cardMemo}>{entry.memo}</span>
        ) : null}
      </div>
    </Link>
  );
}

/*
 * 4点までは全部並べ、5点以上は3枚+「+N」に畳む。
 * 写真が横に並びすぎるとメモの幅が潰れてしまうため。
 */
const MAX_THUMBS = 3;

function visibleThumbs(items: ThumbItem[]): ThumbItem[] {
  if (items.length <= MAX_THUMBS + 1) {
    return items;
  }
  return items.slice(0, MAX_THUMBS);
}

function CardThumbs({
  items,
}: {
  items: ThumbItem[];
}): ReactElement | null {
  if (items.length === 0) return null;

  const shown = visibleThumbs(items);
  const rest = items.length - shown.length;

  return (
    <div className={styles.cardThumbs}>
      {shown.map((item, index) => (
        <div key={index} className={styles.cardThumb}>
          {item.imageUrl ? (
            <img
              className={styles.cardThumbImage}
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
            />
          ) : (
            <span className={styles.cardThumbName}>{item.name}</span>
          )}
        </div>
      ))}
      {rest > 0 ? (
        <div className={styles.cardThumb}>
          <span className={styles.cardThumbMore}>+{rest}</span>
        </div>
      ) : null}
    </div>
  );
}

function CardMeta({
  entry,
}: {
  entry: OutfitEntry;
}): ReactElement | null {
  const parts: string[] = [];
  if (entry.satisfaction !== null) {
    parts.push(`お気に入り度 ${entry.satisfaction}/5`);
  }
  if (entry.weather !== null) {
    parts.push(entry.weather);
  }

  if (parts.length === 0) return null;

  return <span className={styles.cardMeta}>{parts.join(" / ")}</span>;
}
