import type { ReactElement } from "react";

import type { Category } from "@/domain/item/category";
import { CATEGORY_LABELS } from "@/domain/item/category";

import type { WardrobeItem } from "./wardrobeTypes";
import styles from "./ItemCard.module.css";

type Props = {
  item: WardrobeItem;
};

export function ItemCard({ item }: Props): ReactElement {
  const categoryLabel = CATEGORY_LABELS[item.category as Category];

  return (
    <div className={styles.card}>
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
    </div>
  );
}
