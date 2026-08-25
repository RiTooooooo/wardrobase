import { ViewTransition } from "react";
import type { CSSProperties, ReactElement } from "react";

import Link from "next/link";

import { FadeInImage } from "@/components/ui/FadeInImage";
import type { Category } from "@/domain/item/category";
import { CATEGORY_LABELS } from "@/domain/item/category";

import type { WardrobeItem } from "./wardrobeTypes";
import styles from "./ItemCard.module.css";

type Props = {
  item: WardrobeItem;
  /** グリッド内の並び順。表示時のずらし幅に使う */
  index: number;
  /**
   * 詳細ページへ写真をモーフさせるか。
   * 遷移名は画面内で一意である必要があり、同じアイテムが
   * 「All」段とカテゴリ段の両方に描かれるため、
   * 開いている引き出しの中のカードだけ true にする。
   */
  morph?: boolean;
};

function CardImage({ item }: { item: WardrobeItem }): ReactElement {
  return (
    <div className={styles.imageWrapper}>
      {item.imageUrl ? (
        <FadeInImage
          className={styles.image}
          src={item.imageUrl}
          alt={item.name}
        />
      ) : (
        <div className={styles.placeholder} />
      )}
    </div>
  );
}

export function ItemCard({ item, index, morph = false }: Props): ReactElement {
  const categoryLabel = CATEGORY_LABELS[item.category as Category];
  const order = { "--index": index } as CSSProperties;

  return (
    <Link className={styles.card} href={`/items/${item.id}`} style={order}>
      {morph ? (
        <ViewTransition name={`item-image-${item.id}`} share="morph">
          <CardImage item={item} />
        </ViewTransition>
      ) : (
        <CardImage item={item} />
      )}
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
