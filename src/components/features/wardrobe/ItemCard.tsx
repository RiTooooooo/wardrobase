import type { CSSProperties, ReactElement } from "react";

import Link from "next/link";

import type { Category } from "@/domain/item/category";
import { CATEGORY_LABELS } from "@/domain/item/category";

import type { WardrobeItem } from "./wardrobeTypes";
import styles from "./ItemCard.module.css";

type Props = {
  item: WardrobeItem;
  /** グリッド内の並び順。表示時のずらし幅に使う */
  index: number;
};

export function ItemCard({ item, index }: Props): ReactElement {
  const categoryLabel = CATEGORY_LABELS[item.category as Category];
  const order = { "--index": index } as CSSProperties;

  return (
    <Link className={styles.card} href={`/items/${item.id}`} style={order}>
      <div className={styles.imageWrapper}>
        {item.imageUrl ? (
          <img
            className={styles.image}
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{item.name}</span>
        <div className={styles.meta}>
          <span className={styles.category}>{categoryLabel}</span>
          {item.brand ? (
            <span className={styles.brand}>{item.brand}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
