import type { ReactElement } from "react";

import Link from "next/link";

import { FadeInImage } from "@/components/ui/FadeInImage";

import type { OutfitEntry, ThumbItem } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";

/*
 * ルックブックの1記録。台紙にポラロイド写真だけを並べる。
 * メモ・お気に入り度・天気は詳細ページに任せ、一覧は写真に絞る。
 */
export function OutfitCard({
  entry,
}: {
  entry: OutfitEntry;
}): ReactElement {
  return (
    <Link href={`/outfits/${entry.id}`} className={styles.card}>
      <CardThumbs items={entry.items} />
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
            <FadeInImage
              className={styles.cardThumbImage}
              src={item.imageUrl}
              alt={item.name}
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

