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

function CardThumbs({
  items,
}: {
  items: ThumbItem[];
}): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <div className={styles.cardThumbs}>
      {items.map((item, index) => (
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
